if (Meteor.isClient) {
    Template.hello.helpers({
        users: function() {
            return Meteor.users.find();
        }
    });

    Meteor.startup(function() {
        Meteor.subscribe('all-users');
    });

    Meteor.loginAsAdmin = function(name, password, callback) {
        //create a login request with admin: true, so our loginHandler can handle this request
        var loginRequest = {
            devise: true,
            name: name,
            password: password
        };

        //send the login request
        Accounts.callLoginMethod({
            methodArguments: [loginRequest],
            userCallback: function() {
                console.log('callback',arguments);
            }
        });
    };
}

if (Meteor.isServer) {
    Meteor.startup(function () {
        Meteor.publish('all-users', function() {
            return Meteor.users.find();
        });

        Accounts.registerLoginHandler('devise', function(options) {
            //there are multiple login handlers in meteor. 
            //a login request go through all these handlers to find it's login hander
            //so in our login handler, we only consider login requests which has admin field
            console.log('in device registerLoginHandler');
            if(!options.devise) {
                console.log('not devise', options);
                return undefined;
            }

            var user = Meteor.users.findOne({name: options.name})

            console.log('got user');
            if (user._id instanceof Object) {
                console.log('updating id');
                Meteor.users.update({name: options.name}, {$set: {meteor_id: user._id._str}});
            }
            // //our authentication logic :)
            // if(options.password != 'admin-password') {
            //     return null;
            // }

            // //we create a admin user if not exists, and get the userId
            // var userId = null;
            // var user = Meteor.users.findOne({name: 'Admin'});
            //console.log(user);
            console.log('building result');
            var result = {
                userId: user._id._str
            };

            console.log('returning: ', result);
            return result;
        });
    });
}
