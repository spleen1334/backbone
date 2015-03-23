// OVO JE ALIASING $ > JQUERY
(function ($) {
 
    // TODO:
    // NERADI EDIT, DELETE
    // Zbog neke greske ne updatuje kolekciju?


    // TEST DATA
    var contacts = [
        { name: "Contact 1", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "family" },
        { name: "Contact 2", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "family" },
        { name: "Contact 3", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "friend" },
        { name: "Contact 4", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "colleague" },
        { name: "Contact 5", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "family" },
        { name: "Contact 6", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "colleague" },
        { name: "Contact 7", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "friend" },
        { name: "Contact 8", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "family" }
    ];

    // MODEL
    var Contact = Backbone.Model.extend({
        defaults: {
            photo: "img/placeholder.png",
            name: "",
            address: "",
            tel: "",
            email: "",
            type: ""
        }
    });

    // COLLECTION
    var Directory = Backbone.Collection.extend({
        model: Contact
    });


    // VIEWS
    // POJEDINACNI CONTACT
    var ContactView = Backbone.View.extend({
        tagName: "article",
        className: "contact-container",
        template: $('#contactTemplate').html(),

        // EDIT TEMPLATE
        editTemplate: _.template($("#contactEditTemplate").html()),

        render: function() {
            // ovde je malo obrnut templating, zbog jQ
            var tmpl = _.template(this.template);

            this.$el.html(tmpl(this.model.toJSON()));
            return this;
        },

        // EVENTS CONTACTVIEW
        events: {
            'click button.delete': 'deleteContact',
            "click button.edit": "editContact",
            "change select.type": "addType",
            "click button.save": "saveEdits",
            "click button.cancel": "cancelEdit"
        }, 

        deleteContact: function() {
            // this.model se odnosi na onaj koji je aktivirao event
            // mozda moze i sa parametrom
            var removedType = this.model.get("type").toLowerCase();
            
            this.model.destroy();
            
            this.remove();
            
            // Pretrazi kolekciju, ukoliko ne postoji vise TYPE, obrisi ga iz dropboxa
            if (_.indexOf(directory.getTypes(), removedType) === -1) {
                // trazi odgovarajuci <option> uz pomoc [value=]
                directory.$el.find("#filter select").children("[value='" + removedType + "']").remove();
            }
        }, 

        editContact: function () {
            // generisi template
            this.$el.html(this.editTemplate(this.model.toJSON()));
         
            // novi option, add
            var newOpt = $("<option/>", {
                html: "<em>Add new...</em>",
                value: "addType"   
            });
         
            // directory = DirectoryView instance   
            this.select = directory
                            .createSelect()
                            .addClass("type")
                            // pronadji vrednosti type.input
                            .val(this.$el.find("#type").val())
                            // dodaj ga nakon createSelect() option generisanu formu
                            .append(newOpt)
                            .insertAfter(this.$el.find(".name"));
         
            this.$el.find("input[type='hidden']").remove();
        },

        addType: function() {
            // ovo menja select(type) sa input(type)
            if (this.select.val() === "addType") {

                this.select.remove();

                $("<input />", {
                    "class": "type"
                }).insertAfter(this.$el.find(".name")).focus();
            }
        },

        saveEdits: function (e) {
            e.preventDefault();

            var formData = {},
                // previousAttributes - BB builtin
                // Return a copy of the model's previous attributes.
                prev = this.model.previousAttributes();

            //get form data
            $(e.target).closest("form").find(":input").not("button").each(function () {
                var el = $(this);
                formData[el.attr("class")] = el.val();
            });

            //use default photo if none supplied
            if (formData.photo === "") {
                delete formData.photo;
            }

            //UPDATE MODEL ***
            this.model.set(formData);

            //render view
            this.render();

            //if model acquired default photo property, remove it
            if (prev.photo === "img/placeholder.png") {
                delete prev.photo;
            }

            //update contacts array
            // This is where we use the previousAttributes that we saved earlier; 
            // we can't use the current model anymore because its attributes have just been updated.
            _.each(contacts, function (contact) {
                if (_.isEqual(contact, prev)) {
                    // splice 3rd arguement = replace data that has been removed
                    contacts.splice(_.indexOf(contacts, contact), 1, formData);
                }
            });

            // dodaj novu opciju DROPBOX
            if (this.select.val() === "addType") {
                $(directory.el).find("#filter").find("select").remove().end().append(directory.createSelect());
            }
        },

        cancelEdit: function () {
            this.render();
        }


    });

    // VIEWS
    // CEO DIREKTORIJUM KORISNIKA
    var DirectoryView = Backbone.View.extend({
        el: $('#contacts'),

        initialize: function() {
            this.collection = new Directory(contacts);
            this.render();

            // DODAJ DROPBOX
            this.$el.find('#filter').append(this.createSelect());

            // CUSTOM EVENT (DATA)
            this.on('change:filterType', this.filterByType, this); // this = view

            // RERENDER ON COLLECTION RESET
            // We also specify that the callback should use this (as in the instance of the master view) as its context
            // when it is executed. If we don't supply this as the third argument, we will not be able to access the collection 
            // inside the render() method when it handles the reset event.
            this.collection.on('reset', this.render, this);

            // KADA SE DODA NOVA STAVKA U KOLEKCIJU RENDERUJ STAVKU
            this.collection.on('add', this.renderContact, this);

            // REMOVE MODEL EVENT
            this.collection.on("remove", this.removeContact, this);
        },

        render: function() {
            // REMOVE FROM DOM
            this.$el.find("article").remove();
            
            // THIS:
            // this.collection.model = pristupa modelima kolekcije gore definisane (Directory)
            // that > unutar callbacka se menja this, i zato se ovde kesira i koristi (? da li je bez toga vezan za window?)
            // _.each(...., this) > je kontekts, da li to znaci da je this vezan 
            // za this.collection.model pa ga ovim vracamo na View ???
            var that = this;
            // .models > odnosi se na niz svih modela u kolekciji
            // uobicajen je pristup uz pomoc GET ili slicno
            _.each(this.collection.models, function(item) {
                that.renderContact(item);
            }, this);
        },

        renderContact: function(item) {
            var contactView = new ContactView({ model: item });
            this.$el.append(contactView.render().el);
        },

        // SELEKTUJ TYPES (BEZ PONAVLJANJA)
        // _.uniq(array, [isSorted], [iterator]) 
        getTypes: function () {
            return _.uniq(this.collection.pluck("type"), false, function (type) {
                return type.toLowerCase();
            });
        },
         
        // GENERISANJE DROPBOX
        createSelect: function () {
            var filter = this.$el.find("#filter"),
                select = $("<select/>", {
                    html:  "<option value='all'>All</option>"
                });
         
            _.each(this.getTypes(), function (item) {
                var option = $("<option/>", {
                    value: item.toLowerCase(),
                    text: item.toLowerCase()
                }).appendTo(select);
            });
            return select;
        },

        // EVENTS DOM
        events: {
            "change #filter select": "setFilter",
            "click #add": "addContact",
            "click #showForm": "showForm"
        },

        // STORE SELEKTOVANO POLJE <SELECT>
        // e = dom element
        setFilter: function(e) {
            // currentTarget = jQ koji targetuje DOM el koji je triggerovao
            this.filterType = e.currentTarget.value;
            this.trigger('change:filterType');
        },

        // OVDE SE VRSI FILTRIRANJE
        filterByType: function() {
            // UKOLIKO JE ALL, PONOVO LOADUJ KOLEKCIJU SVIM CONTATCS
            if(this.filterType === 'all') {
                this.collection.reset(contacts);

                // REDIRECT TO
                contactsRouter.navigate("filter/all");
            } else {
                // ne aktivira event sa silent
                // resetuje da bi ponovo vratio sve kontakte u kolekciju
                // u slucaju da kolekcija sadrzi neke prethodno  filternovane iteme
                this.collection.reset(contacts, {silent: true});

                // UKOLIKO NIJE ALL, NAPUNI KOLEKCIJU SA FILTEROVANIM STAVKAMA
                var filterType = this.filterType,
                    filtered = _.filter(this.collection.models, function(item) {
                        return item.get("type") === filterType;
                    });

                this.collection.reset(filtered);

                //REDIRECT TO
                contactsRouter.navigate("filter/" + filterType);
            }
        },

        addContact: function(e) {
            e.preventDefault();

            var formData = {};
            // $.each(index, element)
            $('#addContact').children('input').each(function(i, elem) {
                if($(elem).val !== "") {
                    // UCITAJ SVE INPUTE U NIZ (ukoliko imaju neki value)
                    // elem.id = obj; $(elem) = jQ objekat da bi moglo da se pristupi JQ methodi val()
                    formData[elem.id] = $(elem).val();
                }
            });

            contacts.push(formData);

            // PROVERI DA LI POSTOJI VEC POSTOJI TYPE CONTACTS
            // _.indexOf(array, targetValue): 1-true, -1 - false
            if (_.indexOf(this.getTypes(), formData.type) === -1) {
                this.collection.add(new Contact(formData));
                // Update <select> sa novom stavkom ukoliko nije vec definisan tip
                this.$el
                    .find("#filter")
                    .find("select")
                    .remove().end()
                    .append(this.createSelect()); 
            } else {
                // tip vec postoji samo updateuj kolekciju
                this.collection.add(new Contact(formData));
            }

        },

        removeContact: function (removedModel) {
            // attributes bb builtin
            var removed = removedModel.attributes;
             
            // Nisam siguran zasto brisemo .photo
            if (removed.photo === "/img/placeholder.png") {
                // delete operator, brise property iz objekta
                delete removed.photo;
            }
         
            // PROLAZI KROZ SVAKI CONTACTS
            _.each(contacts, function (contact) {
                // PROVERAVA DA LI JE NEKA STAVKA ISTA SA REMOVED
                if (_.isEqual(contact, removed)) {
                    // UKOLIKO JESTE uklanja je iz contacts array
                    // uz pomoc JS .splice
                    //removes 1 element from indexOf(trazeni kontakt element)
                    contacts.splice(_.indexOf(contacts, contact), 1);
                }
            });
        },

        showForm: function() {
            // Animira addContact form
            this.$el.find("#addContact").slideToggle();
        }
    });


    // ROUTER
    var ContactsRouter = Backbone.Router.extend({
        routes: {
            'filter/:type': 'urlFilter'
        },

        urlFilter: function(type){
            directory.filterType = type;
            directory.trigger('change:filterType');
        }
    });


    // START APP
    var directory = new DirectoryView(); 
    var contactsRouter = new ContactsRouter();

    // START ROUTER
    Backbone.history.start();


} (jQuery));
