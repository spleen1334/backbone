var app = app || {};

// View
app.AppView = Backbone.view.extend({
	// dom element
	el: '#todoapp',
	
	// template engine
	statsTemplate: _.template($('#stats-template').html()),

	// eventovi (kontroleri) sa funkcijama
	events: {
		'keypress #new-todo': 'createOnEnter',
		'click #clear-completed': 'clearCompleted',
		'click #toggle-all': 'toggleAllComplete'
	},

	initialize: function() {
		// cashovane lokacije iz doma
		// this.$el - zapamtiti ovo
		this.allCheckbox = this.$(#toggle-all)[0];
		this.$input = this.$('#new-todo');
		this.$footer = this.$('#footer');
		this.$main = this.$('#main');

		// kacenje event listenera na kolekciju
		this.listenTo(app.Todos, 'add', this.addOne);
		this.listenTo(app.Todos, 'reset', this.addAll);

		this.listenTo(app.Todos, 'change:completed', this.filterOne);
		this.listenTo(app.Todos, 'filter', this.filterAll);
		this.listenTo(app.Todos, 'all', this.render);

		app.Todos.fetch(); // ovo je neka vrsta komunikacije sa serverom - ovde valjda sa localStorage
	},

	// render prikaz svega
	render: function() {
		// pozivanje funkcija iz kolekcije
		var completed = app.Todos.completed().length;
		var remaining = app.Todos.remaining().length;

		// ukoliko postoji app.Todos kolekcija
		if ( app.Todos.length ) {
			this.$main.show();
			this.$footer.show();

			// ovo je prikazivanje statistike u footeru, iz kolekcije
			// ucitava se u statsTemplate kao argumenat (currying)
			this.$footer.html(this.statsTemplate({
				completed: completed,
				remaining: remaining
			}));

			// ovde se u okviru templata iz indexa, uklanja klasa selekted
			// onda se jQ filtriraju svi elementi iz selektora da bi se ostavio onaj koji je prosao selekciju
			// i njemu se onda dodeljuje klasa .selected
			this.$('#filters li a')
				.removeClass('selected')
				.filter('[href="#/' + ( app.TodoFilter || '' ) + '"]')
				.addClass('selected');
		} else { 
			// ako nema app.todos kolekcije onda sakri elemente
			this.$main.hide();
			this.$footer.hide();
		}

		this.allCheckbox.checked = !remaining; // ??
	},

	// dodavanje jednog todo elementa u listu
	// i ubacivanje u dom uz pomoc jquery i render
	addOne: function( todo )  {
		var view = new app.TodoView({ model: todo });
		$('#todo-list').append( view.render().el);
	},

	// za kompletnu todo listu
	addAll: function() {
		this.$('#todo-list').html();
		app.Todos.each(this.addOne, this); // filtrira sve elemente iz kolekcije, nije mi jasno tanco kako
	}

});