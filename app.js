const express = require("express");
const mongoose = require("mongoose");
const app = express();
const _ = require('lodash');
let items = [];

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1/todolistDB");

const itemsSchema = mongoose.Schema({
    name: {
        type: String,
    },
});

const Item = mongoose.model("item", itemsSchema);

const item1 = new Item({
    name: "wake up",
});
const item2 = new Item({
    name: "Brush Teeth",
});
const item3 = new Item({
    name: "Learn to backflip",
});

const defaultItems = [item1, item2, item3];

const listSchema = mongoose.Schema({
    name: String,
    items: [itemsSchema],
});

const List = mongoose.model("list", listSchema);

app.get("/", function (req, res) {
    Item.find({})
        .then((foundItem) => {
            if (foundItem.length == 0) {
                return Item.insertMany(defaultItems);
            } else {
                return foundItem;
            }
        })
        .then((savedItem) => {
            res.render("list", { listTitle: "Today", newListItems: savedItem });
        })
        .catch((err) => console.log(err));
});

app.post("/", function (req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName,
    });

    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName }).then((foundList) => {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
});

app.post("/delete", function (req, res) {
    const deletedItem = req.body.checkbox;
    const listName = req.body.listName;
    if (listName == "Today") {
        Item.findByIdAndRemove(deletedItem).then(
            console.log("successfully deleted id " + deletedItem)
        );
    } else {
        List.findOne({ name: listName})
          .then(foundlist => {
            foundlist.items.pull({ _id: deletedItem });
            foundlist.save()
            res.redirect("/" + listName);
        })
    
}});

app.get("/:id", function (req, res) {
    const listName = _.capitalize(req.params.id);
    List.findOne({ name: listName }).then((foundName) => {
        if (!foundName) {
            // create new list
            const list = new List({
                name: listName,
                items: defaultItems,
            });
            list.save()
            // res.render("list", {
            //     listTitle: listName,
            //     newListItems: foundName.items,
            res.redirect("/" + listName)
            } else {
            // show existing list
            res.render("list", {
                listTitle: listName,
                newListItems: foundName.items,
            })
        }})
    });

app.get("/about", function (req, res) {
    res.render("about");
});

app.listen(3000, function () {
    console.log("Server started on port 3000");
});
