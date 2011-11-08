var PageController = require('./controllers/page');

module.exports = function(app) {
    PageController.init(app);
    /**
     * Home Page
     */
    app.get('/', function(req, res) {
        PageController.index(req, res);
    });
}
