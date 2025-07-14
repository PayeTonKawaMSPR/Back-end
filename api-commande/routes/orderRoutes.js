/*const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Voir toutes les commandes
router.get('/', async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
});

// Créer une commande
router.post('/', async (req, res) => {
  const newOrder = new Order(req.body);
  await newOrder.save();
  res.status(201).json(newOrder);
});

module.exports = router;
// Modifier une commande
router.put('/:id', async (req, res) => {
  const updated = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// Supprimer une commande
router.delete('/:id', async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.json({ message: "Commande supprimée" });
});*/



const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const { validateBody, validateQuery, validateIdParam } = require('../middleware/validate');
const auth = require('../middleware/auth');
const { publish } = require('../rabbitmq');
const Joi = require('joi');

const orderSchema = Joi.object({
  customerId: Joi.string().required(),
  products: Joi.array().items(
    Joi.object({ productId: Joi.string().required(), quantity: Joi.number().integer().min(1).required() })
  ).min(1).required()
});
const querySchema = Joi.object({ page: Joi.number().integer().min(1).default(1), limit: Joi.number().integer().min(1).default(10) });

// create
router.post('/', auth, validateBody(orderSchema), async (req, res, next) => {
  try {
    const doc = await Order.create(req.body);
    await publish('mspr.exchange','order.created', doc);
    res.status(201).json(doc);
  } catch (err) { next(err); }
});
// list
router.get('/', auth, validateQuery(querySchema), async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const skip = (page-1)*limit;
    const [total, data] = await Promise.all([ Order.countDocuments(), Order.find().skip(skip).limit(limit) ]);
    res.json({ page, limit, total, data });
  } catch(err){ next(err); }
});
// get
router.get('/:id', auth, validateIdParam, async (req,res,next)=>{
  try{
    const doc = await Order.findById(req.params.id);
    if(!doc) return res.status(404).json({message:'Order not found'});
    res.json(doc);
  }catch(e){next(e);}
});
// update
router.put('/:id', auth, validateIdParam, validateBody(orderSchema), async(req,res,next)=>{
  try{
    const updated = await Order.findByIdAndUpdate(req.params.id, req.body, { new:true, runValidators:true });
    if(!updated) return res.status(404).json({message:'Order not found'});
    await publish('mspr.exchange','order.updated', updated);
    res.json(updated);
  }catch(e){next(e);}
});
// delete
router.delete('/:id', auth, validateIdParam, async(req,res,next)=>{
  try{
    const del = await Order.findByIdAndDelete(req.params.id);
    if(!del) return res.status(404).json({message:'Order not found'});
    await publish('mspr.exchange','order.deleted',{id:req.params.id});
    res.status(204).end();
  }catch(e){next(e);}
});

module.exports = router;