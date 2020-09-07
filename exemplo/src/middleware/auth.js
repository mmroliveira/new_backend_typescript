const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth.json');

module.exports = (request, response, next) => {
    // recebendo o token da header da requisicão
    const authHeadder = request.headers.authorization;

    // caso não seja enviado nada, é enviado uma mensagem 
    if(!authHeadder)
        return response.status(401).send({error: 'o token não foi enviado'});
    
    // fazendo um split do token 
    const parts = authHeadder.split(' ');
    
    // se não tiver exatamente duas partes é retornado uma mensagem de erro
    if(!parts.length === 2)
        return response.status(401).send({error: 'Token com formato invalido'});
    
    // enviado para constantes diferentes as partes do token
    const [scheme, token] = parts;
    
    // verificando se a primeira parte do token contem a palavra 'Bearer'
    if(!/^Bearer$/i.test(scheme))
        return response.status(401).send({error: 'Token com formato invalido'});
    
    // fazendo a validacão final com a chave secreta
    jwt.verify(token, authConfig.secret, (err, decoded) => {
        // caso o token recebido for invalido é enviado uma mensagem
        if(err)
            return response.status(401).send({error: 'Token invalido'});
        
        // caso de tudo ok o requisicão é autorizada a continuar o seu fluxo
        request.userId = decoded.user_id;
        return next();
    })
}