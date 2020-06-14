var express = require('express');
var router = express.Router();
var csrf = require('csurf')
var csrfProtection = csrf({cookie: true})

/* GET home page. */
router.get('/', function (req, res, next) {
    if (req.session.count !== undefined) {
        ++req.session.count;
    }
    req.db.all("SELECT * FROM memes ORDER BY price DESC LIMIT 3", function (err, memes) {
        res.render('index', {
            title: 'Meme market',
            count: req.session.count,
            user: req.session.login,
            message: 'Hello there!',
            memes: memes,
            headerMeme: req.app.get('headerMeme')
        });
    });
});

router.post('/', function (req, res, next) {
    req.db.get("SELECT * FROM users WHERE username = ?", [req.body.login],
        function (err, row) {
            if (row !== undefined) {
                req.session.login = req.body.login;
                req.session.user_id = row.id;
                req.session.count = 0;
            }
            res.redirect('/');
        });
});

router.get('/logout', function (req, res, next) {
    delete (req.session.count);
    delete (req.session.login);
    delete (req.session.user_id);
    res.redirect('/');
});

router.get('/meme/:memeId', csrfProtection, function (req, res) {
    if (req.session.count !== undefined) {
        ++req.session.count;
    }
    req.db.get("SELECT * FROM memes WHERE id = ?", [req.params.memeId], function (err, row) {
        if (row !== undefined) {
            req.db.all("SELECT * FROM history WHERE meme_id = ? ORDER BY date", [req.params.memeId], function (err2, history) {
                res.render('meme', {
                    meme: row,
                    history: history,
                    user: req.session.login,
                    count: req.session.count,
                    csrfToken: req.csrfToken()
                });
            })
        } else {
            res.render('meme_not_found', {
                id: req.params.memeId,
                count: req.session.count,
            });
        }
    });
})

router.post('/meme/:memeId', csrfProtection, function (req, res) {
    if (req.session.login !== undefined) {
        req.db.run("INSERT INTO history VALUES(?, ?, ?, (SELECT date('now')))", [req.params.memeId, req.session.user_id, req.body.price]);
        req.db.run("UPDATE memes SET price = ? WHERE id = ?", [req.body.price, req.params.memeId]);
    }

    res.redirect('/meme/' + req.params.memeId);
})

module.exports = router;
