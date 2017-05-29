const Hapi = require('hapi');
const Joi = require('joi');
const Boom = require('boom');
const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');

const server = new Hapi.Server();
server.connection({
  port:3001
});

const options = {
    info: {
            'title': 'Test API Documentation',
            'version': '0.1.0',
        }
};

server.register([
    Inert,
    Vision,
    {
        'register': HapiSwagger,
        'options': options
    }], (err) => {
        server.start( (err) => {
           if (err) {
                console.log(err);
            } else {
                console.log('Server running at:', server.info.uri);
            }
        });
    });

var requestCount = 0;

const contactsPath = '/api/contacts/';
const specificContactsPath = `${contactsPath}{id?}`;
const validate = {
      params: Joi.object({
        id: Joi.number()
      }),
      query: Joi.object({
        profile: Joi.string().regex(/[a-z]/)
      })
};
const preHandler = [
    {
      method: (request, reply) => {
        requestCount++;
        reply({a:1,b:2});
    },
    assign:'obj'
    }
];

server.route({
  method: 'GET',
  path: contactsPath,
  config: {
    validate: validate,
    pre: preHandler,
    description: 'get contact list',
    tags: ['api']
  },
  handler: (request, reply) => {
    //console.log(request.headers);
    reply('User list');
  }
});

server.route({
  method: 'GET',
  path: specificContactsPath,
  config: {
    validate: validate,
    pre: preHandler,
    description: 'get a contact info',
    tags: ['api']
  },
  handler: (request,reply) => {
    const id = request.params.id;
    const profile = request.query.profile;
    const {pre} = request;

    if (!profile) {
     reply(Boom.notFound('No contacts found!'));
     return;
   }

    console.log('params', request.params);
    console.log('query', request.query);
    reply(requestCount);
  }
});

server.route({
  method: 'POST',
  path: contactsPath,
  config: {
    validate: validate,
    pre: preHandler,
    description: 'create new contact with profile',
    tags: ['api']
  },
  handler: (request,reply) => {
    const profile = request.query.profile;

    reply(`Create new user with profile: ${profile}`);
  }
});

server.route({
  method: 'PUT',
  path: specificContactsPath,
  config: {
    validate: validate,
    pre: preHandler,
    description: 'update a exist contact by id',
    tags: ['api']
  },
  handler: (request,reply) => {
    const id = request.params.id;
    const profile = request.query.profile;
    const {pre} = request;

    if (!profile) {
     reply(Boom.notFound('No contacts found!'));
     return;
    }
    reply(`Update user ${id} with profile: ${profile}`);
  }
});

server.route({
  method: 'DELETE',
  path: specificContactsPath,
  config: {
    validate: validate,
    pre: preHandler,
    description: 'remove a exist contact by id',
    tags: ['api']
  },
  handler: (request,reply) => {
    const id = request.params.id;
    const {pre} = request;

    reply(`Delete user ${id}`);
  }
});



server.start((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(server.info);
  }
})