let App = require("..").default;
let { join } = require("path");
let serve = require("koa-static");
let app = new App();
app.use(serve(join(__dirname, "public/")));
exports.handler = app.run();
