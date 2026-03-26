const express = require("express");
const verify = require("./verify");

const app = express();
app.use(express.json());

app.post("/verify", (req, res) => {
    const { message, signature, publicKey } = req.body;

    const ok = verify(message, signature, publicKey);

    res.json({ success: ok });
});

app.listen(3001, () => {
    console.log("Verify service running on 3001");
});
