var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var redis = require('redis');

var app = express();

// create client
let client = redis.createClient();
client.on('connect', ()=>{
	console.log('Redis server connected...');
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
	let title = "Task List";
	client.lrange('tasks', 0, -1, (err, tasks)=>{
		if(err){
			console.log(err)
		} else {
			res.render('index', {
				title: title,
				tasks: tasks
			})
		}
	})
});

app.post('/task/add', (req, res)=>{
	let task = req.body.task;
	client.rpush('tasks', task, (err, reply)=>{
		if(err){
			console.log(err)
		} else {
			res.redirect('/');
		}
	})
})

app.post('/task/delete', (req, res)=>{
	var tasksToDel = req.body.tasks;

	client.lrange('tasks', 0, -1, function(err, tasks){
		tasks.forEach((task)=>{
			if(tasksToDel.indexOf(task) > -1){
				client.lrem('tasks',0, task, function(){
					if(err){
						console.log(err);
					}
				});
			}
		})
		res.redirect('/');
	});
});

app.listen(3000, () => {
  console.log(`Server listening at 3000...`);
});

module.exports = app;