let App = require("..").default;
let { join } = require("path");
let serve = require("koa-static");
let app = App({ middlewares: [serve(join(__dirname, "public/"))] });
app.run();
