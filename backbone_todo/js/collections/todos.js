var app = app || {};

// Todo COLLECTION
var TodoList = Backbone.Collection.extend({
	model: app.Todo,

	localStorage: new Backbone.LocalStorage('todos-backbone'),

	completed: function() {
		return this.filter(function( todo ) {
			return todo.get('completed');
		});
	},

	// mala koska, da li je this.without kolekcija, a trebalo bi da se apply() odnosi na vrednosti koje zelimo da oduzmemo
	// without _.js
	remaining: function() {
		return this.without.apply( this, this.completed() );
	},


	// opet lepo resenje, u slucaju da dodje do kraja niza (this.length=0) onda to koristi za vracanje 1
	// u suprotnom uzima poslednji elemenat niza, order + 1 videti na sta se tacno odnosi ovo
	nextOrder: function() {
		if (!this.length) {
			return 1;
		}
		// last _.js
		return this.last().get('order') + 1;	
	},

	comparator: function( todo ) {
		return todo.get('order');
	}
});

app.Todos = new TodoList();