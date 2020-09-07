const express = require('express'); 
const multer = require('multer');
const multerConfig = require('./config/multer');

const AuthController = require('./controllers/authController');
const UserController = require('./controllers/UserController');
const UploadController = require('./controllers/uploadController');
const AdditionalController = require('./controllers/additionalController');
const ShoppingCartController = require('./controllers/shoppingCartController');

const ProductsController = require('./controllers/productsController');
const CategoryController = require('./controllers/categoryController');

const authMiddleware = require('./middleware/auth');

const routes = express.Router();

// rotas para cadastro e listagem de usuarios
routes.get('/user', UserController.listUser)
routes.post('/user', UserController.register);
routes.get('/getUser/:user_id', UserController.getUser);

// rotas para recuperacão de senha
routes.post('/validateToken', AuthController.validateToken);
routes.post('/reset_password', AuthController.resetPassword);
routes.post('/forgot_password', AuthController.forgotPassword);

// rotas de autenticacão
routes.post('/authenticate', AuthController.authenticate);
routes.get('/validate_authenticate', authMiddleware, AuthController.validate_authenticate);

// rotas para upload de imagens
routes.get('/list/products/', UploadController.getProducts);
routes.get('/list/category/', UploadController.getCategory);
routes.get('/list/allcategory', UploadController.getAllCategory);
routes.post('/upload/category/:category_name', multer(multerConfig).single('file'), UploadController.uploadCategory );
routes.post('/upload/product', multer(multerConfig).single('file'), UploadController.uploadProduct );

// rotas para criacão de adicionais para os produtos
routes.post('/additional/create', AdditionalController.create);
routes.post('/additional/create2', AdditionalController.getAdditional);
routes.post('/additional/create3', AdditionalController.addObj);

// rotas que controlam produtos
routes.get('/get_products', ProductsController.getProducts);

// rotas que controlam categorias
routes.get('/get_category', CategoryController.getCategory);

routes.post('/setShoppingCart', ShoppingCartController.setShoppingCart);
routes.post('/getShoppingCart', ShoppingCartController.getShoppingCart);
routes.delete('/deleteShoppingCartProduct/:user_id', ShoppingCartController.deleteShoppingCartProduct);
// rotas de teste
routes.get('/testAzure', UploadController.testAzure);

module.exports = routes;