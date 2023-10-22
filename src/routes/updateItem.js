const db = require('../persistence');

module.exports = async (req, res) => {
    await db.updateItem(req.params.id, {
        name: req.body.name,
        // Change here
        completed: req.body.completed,
    });
    const item = await db.getItem(req.params.id);
    res.send(item);
};
