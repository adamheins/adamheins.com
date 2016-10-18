'use strict';

let express = require('express');
let router = express.Router();

router.get('/', (req, res) => {
    res.render('recipes');
});

router.get('/*', (req, res, next) => {
    res.render('recipes' + req.path, {}, (err, html) => {
        if (err) {
            next();
        } else {
            res.send(html);
        }
    });
});

module.exports = router;
