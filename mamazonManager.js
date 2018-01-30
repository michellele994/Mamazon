var inquirer = require("inquirer");
var consoleTable = require("console.table");
var mysql = require("mysql");
var results;
var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "root",
	database: "mamazon"
});
connection.connect(function(err) {
	if (err) throw err;
	console.log("Howdy, boss!\n");
	ask();
});

function ask() 
{
	inquirer.prompt([
	{
		type: "list",
		name: "action",
		message: "What is it that you would like to do today?",
		choices: ["View Products for Sale","View Low Inventory","Add to Inventory", "Add New Product", "Exit"]
	},
	{
		type: "input",
		name: "selectToAdd",
		message: "Type the item ID of the item you wish to update.",
		when: function(answer)
		{
			return answer.action === "Add to Inventory";
		}
	},
	{
		type: "input",
		name: "newID",
		message: "What is the new item's ID? (Please do not use the same ID as an existing product)",
		when: function(answer)
		{
			return answer.action === "Add New Product";
		}
	},
	{
		type: "input",
		name: "prodName",
		message: "What is the new product's name?",
		when: function(answer)
		{
			return answer.action === "Add New Product";
		}
	},
	{
		type: "input",
		name: "depName",
		message: "Which department does it belong to?",
		when: function(answer)
		{
			return answer.action === "Add New Product";
		}
	},
	{
		type: "input",
		name: "price",
		message: "How much will it cost?",
		when: function(answer)
		{
			return answer.action === "Add New Product";
		}
	},
	{
		type: "input",
		name: "amountToAdd",
		message: "How much would you like to add?",
		when: function(answer)
		{
			return (answer.action === "Add to Inventory" || answer.action === "Add New Product");
		}
	}
	]).then(function(answer) {
		if(answer.action === "View Products for Sale")
		{
			readProducts();
			ask();
		}
		else if(answer.action === "View Low Inventory")
		{
			showLowInventory();
			ask();
		}
		else if(answer.action === "Add to Inventory")
		{
			connection.query("SELECT * FROM products", function(err, res) {
				if (err) throw err;
				results = res;
			});
			setTimeout(function(){
				if(doesIDExist(answer.selectToAdd) && answer.amountToAdd > 0 )
				{
					addToInventory(answer.amountToAdd, answer.selectToAdd);
				}
				else if(!doesIDExist(answer.selectToAdd))
				{
					console.log("That item ID currently does not exist. Click 'Add New Product' if you want to add something that doesn't currently exist");
				}
				else if (answer.amountToAdd <= 0)
				{
					console.log("Please enter an amount that is greater than 0");
				}
			},500);
		}
		else if(answer.action === "Add New Product")
		{
			connection.query("SELECT * FROM products", function(err, res) {
				if (err) throw err;
				results = res;
			});
			setTimeout(function()
			{
				if(doesIDExist(answer.newID))
				{
					console.log("That ID already exists. Please choose a new ID. Click View All Products to see what already exists");
				}
				else if(!doesIDExist(answer.newID) && answer.price >= 0)
				{
					addNewProduct(answer.newID, answer.prodName, answer.depName, answer.price, answer.amountToAdd);
				}
			},500);
		}
	});
}

function readProducts()
{
	console.log("Selecting all products...\n");
	connection.query("SELECT * FROM products", function(err, res) {
		if (err) throw err;
		results = res;
		console.table(results);
	});
}

function showLowInventory()
{
	console.log("Showing low inventory");
	connection.query("SELECT * FROM products WHERE stock_quantity < 5",
	function(err, res) {
		if (err) throw err;
		console.table(res);
		results = res;
	})
}
function addToInventory(amount, product)
{
	console.log("Adding to inventory");
	var query = connection.query(
	"UPDATE products SET stock_quantity = stock_quantity +" +amount+"  WHERE ?",
	[
		{
			item_id: product
		}
	],
		function(err, res) {
			console.log("Items have been added!");
		}
	);

}
function addNewProduct(id, prod_name, dep_name, price, quantity)
{
	console.log("Inserting a new product...\n");
	var query = connection.query(
		"INSERT INTO products SET ?",
		{
			item_id: id,
			product_name: prod_name,
			department_name: dep_name,
			price: price,
			stock_quantity: quantity
		},
		function(err, res) {
			console.log("New item has been added!!! Click View All Products to see it!")
		}
	);
}
function doesIDExist(id)
{
	for (var i = 0; i < results.length; i++)
	{
		if(id == results[i].item_id)
		{
			// location = i;
			return true;
			break;
		}
	}
}