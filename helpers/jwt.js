const expressJwt = require('express-jwt');

function authJwt() {
    const secret = process.env.SECRETKEY
    return expressJwt({
        secret,
        algorithms:['HS256'],
        isRevoked : isRevoked
    }).unless({
        path:[
            '/api/v1/users/login',
            '/api/v1/users/register',
            { url: /\/api\/v1\/products(.*)/, methods: ['GET' , 'OPTIONS']  },
            { url: /\/api\/v1\/categories(.*)/, methods: ['GET' , 'OPTIONS'] },
            { url: /\/public\/uploads(.*)/, methods: ['GET' , 'OPTIONS'] }
        ]
    })
  }

 
async function isRevoked(req, payLoad , done) {
    if(!payLoad.isAdmin){
        done(null , true)
    }
    done();
  }

  module.exports = authJwt;