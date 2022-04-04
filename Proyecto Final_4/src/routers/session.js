import jwt from 'jsonwebtoken'

function generateToken(config, user) {
  const token = jwt.sign({ data: user }, config.jwt_key, { expiresIn: config.expire_time });
  return token;
}

function getAuthMiddleware(config){

  const auth = function auth(req, res, next) {
    const authHeader = req.headers.authorization;
  
    if (!authHeader) {
      return res.status(401).json({
        error: 'not authenticated'
      });
    }
  
    const token = authHeader.split(' ')[1];
  
    jwt.verify(token, config.jwt_key, (err, decoded) => {
      if (err) {
        return res.status(403).json({
          error: 'not authorized'
        });
      }
  
      req.user = decoded.data;
      next();
    });
  };

  return auth;

}



export {generateToken, getAuthMiddleware}