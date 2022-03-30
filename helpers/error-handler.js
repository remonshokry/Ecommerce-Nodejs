function errorHandler(err , req , res, next){
    //auth error
    if (err.name == 'UnauthorizedError'){
        return res.status(401).json({message : 'The user in unauthorized'});
    }
    //validation error
    if(err.name == 'ValidationError')
    {
        return res.status(401).json({message : 'Validation'});
    }
    //default errors
    return res.status(500).json({message : err.message});
}

module.exports = errorHandler;