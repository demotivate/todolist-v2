//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin:QFJKKeMFJYyExgZv@cluster0.oxdgfr0.mongodb.net/todolistDB");

const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item", itemsSchema);

const buyFood = new Item({
  name: "Buy Food"
});
const cookFood = new Item({
  name: "Cook Food"
});
const eatFood = new Item({
  name: "Eat Food"
});
const defaultItems = [buyFood, cookFood, eatFood];


const listSchema = {
  name: String,
  items: [itemsSchema],
};
const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  Item.find({})
    .then(result => {
      if(result.length === 0){
        Item.insertMany(defaultItems)
          .then(() =>{
            console.log("Default items inserted successfully");
          })
          .catch(err => {
            console.log("Error inserting default items: " + err);
          });
        
        res.redirect("/");
      }else{
        res.render("list", {listTitle: "Today", newListItems: result});
      }
    })
    .catch(err => {
      console.log("Error finding data in db: " + err);
    });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name: itemName,
  });

  if(listName === "Today"){
    newItem.save()
    res.redirect("/");
  } else{
    List.findOne({name: listName})
      .then(list => {
        list.items.push(newItem);
        list.save();
        res.redirect("/" + listName);
      })
      .catch(err => {
        console.log(err);
      });
  }

});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId)
      .then(() => {
        console.log("Successfully deleted ItemID " + checkedItemId)
        res.redirect("/");
      })
      .catch(err => {
        console.log("Error deleting Item" + err)
      });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})
    .then(result => {
      res.redirect("/" + listName);
    })
    .catch(err => {
      console.log(err);
    });
  }

});

app.get("/:listName", (req, res) => {
  const customListName = _.capitalize(req.params.listName);

  List.findOne({name: customListName})
    .then((list) => {
      if(!list){
        //create new list
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
      
        list.save();

        res.redirect("/" + customListName);
      }else{
        //show existing list
        
        res.render("list", {listTitle: list.name, newListItems: list.items});
      }
    })
    .catch((err) => {
      console.log(err);
    });

  
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
