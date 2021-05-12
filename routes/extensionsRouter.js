const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const Extension = require('../models/extensions');

const extensionRouter = express.Router();

extensionRouter.use(bodyParser.json());

extensionRouter.route('/')
.get(authenticate.verifyAdmin, (req, res, next) => {
    Extension.find({})
    .then((extensions) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(extensions);
    })
    .catch((err) =>  next(err));
})

.post(authenticate.verifyOwner, (req, res, next) => {
    Extension.create(req.body)
    .then((extension) => {
        console.log('extension installed', extension)
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(extension);
    })
    .catch((err) => next(err));
})


.delete(authenticate.verifyOwner, (req, res, next) => {
    Extension.remove({})
    .then((extensions) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(extensions);
    })
    .catch((err) => next(err));
});

extensionRouter.route('/:extensionId')
.get(authenticate.verifyAdmin, (req, res, next) => {
    Extension.findById(req.params.extensionId)
    .then((extension) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(extension);
    })
    .catch((err) => next(err));
})

.delete(authenticate.verifyOwner, (req, res, next) => {
    Extension.findByIdAndDelete(req.params.extensionId)
    .then((extension) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(extension);
    })
    .catch((err) => next(err));
});

extensionRouter.route('/del/:extensionName')
.delete(authenticate.verifyOwner, (req, res, next) => {
    Extension.findOneAndDelete({'fileName': req.params.extensionName})
    .then((extension) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(extension);
    })
    .catch((err) => next(err));
});

module.exports = extensionRouter;