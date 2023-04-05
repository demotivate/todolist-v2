//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB");

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

  const newItem = new Item({
    name: itemName,
  });
  newItem.save()
  res.redirect("/");
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  Item.findByIdAndRemove(checkedItemId)
    .then(() => {
      console.log("Successfully deleted ItemID " + checkedItemId)
    })
    .catch(err => {
      console.log("Error deleting Item" + err)
    });

  res.redirect("/");
});

app.get("/:listName", (req, res) => {
  const customListName = req.params.listName;

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
