var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
	res.render('landingPage', {})
});

// Temporary Routing!

/* GET main page*/
router.get('/main', function (req, res) {
	res.render('dashBoard_main', {
		user:" Jonathan"
	})
});

/* GET main page*/
router.get('/historicalHeatmap', function (req, res) {
	res.render('dashBoard_historicalHeatmap', {
		user:" Jonathan"
	})
});

/* GET main page*/
router.get('/presenceLaneChart', function (req, res) {
	res.render('dashBoard_presenceLaneChart', {
		user:" Jonathan"
	})
});

/* GET main page*/
router.get('/stringGraph', function (req, res) {
	res.render('dashBoard_stringGraph', {
		user:" Jonathan"
	})
});

/* GET main page*/
router.get('/index', function (req, res) {
	res.render('index', {
		user:" Jonathan"
	})
});

module.exports = router;
