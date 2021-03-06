// OBJ: ukoliko ne postoji app onda je = prazan Obj
// app je nasa aplikacija
var app = app || {};

// MODEL
// title, completed, order
app.Todo = Backbone.Model.extend({
	// default za svaki todo model
	defaults: {
		title: '',
		completed: 'false'
	},
	// funkcija koja toggleuje completed
	toggle: function() {
		// save()is called on a model that was fetched from the server, it constructs a URL by
		// appending the model’s  idto the collection’s URL and sends an HTTP PUT to the server
		this.save({
			// odlicno resenje, uvek daje suprotnu vrednost od postavljene
			completed: !this.get(completed)
		});
	}


});
