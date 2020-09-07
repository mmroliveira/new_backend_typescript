// modoulo para gerar um token
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const authConfig = require("../config/auth.json");

// modulo para criptografar uma senha
const bcrypt = require("bcryptjs");

// modulo para enviar os e-mail
const mailer = require("../models/index");

// modulo que faz a conexão com o banco de dados
const connection_db = require("../database/connection_db");

function generateToken(params = {}) {
	return jwt.sign(params, authConfig.secret, {
		expiresIn: 86400,
	});
}

// modulo revisado apos as alteracões no DB
module.exports = {
	// funcão para fazer a autenticacao de um usuario (login)
	async authenticate(request, response) {
		// pegando o email que vem pela requisicão
		const { user_email, user_password } = request.body;

		try {
			// fazendo um select dos dados do usuario de acordo com o email recedibo
			const [user] = await connection_db("user")
				.where({ user_email: user_email })
				.select("user_id", "user_name", "user_email", "user_password");

			// caso não exista um registro com o email recebido, ira cair nesse if onde
			// é retornado uma mensagem de erro
			if (!user)
				return response
					.status(400)
					.send({ errorTitle: "E-mail e/ou senha inválido(s)", errorMessage: null });

			// caso exista um registro na base de dados, verifico se a senha está correta
			// caso a senha não for a correta é enviado uma mensagem de erro
			if (!(await bcrypt.compare(user_password, user.user_password)))
				return response
					.status(400)
					.send({ errorTitle: "E-mail e/ou senha inválido(s)", errorMessage: null });

			// caso de tudo certo, é retornado os dados do usuario, token e uma mensagem de sucesso
			const authenticatedUser = {
				user_id: user.user_id,
				user_name: user.user_name,
				user_email: user.user_email,
			}
			
			response.send({
				user: authenticatedUser,
				token: generateToken({ user_id: user.user_id }),
				mensagem: "Login com sucesso!",
			});
		} catch (err) {
			// casso ocorra algum erro, (email não se passado na requisicão por exemplo)
			// é retornado uma mensagem generica
			return response
				.status(500)
				.send({ mensagem: "Falha na autenticação, tente novamente", err: err });
		}
	},

	// funcão para validar a autenticacao de um usuario que ja realizou um "login"
	async validate_authenticate(request, response) {
		response.send({ ok: "true", user: request.userId });
	},

	// funcão para recuperacão de senha
	// verifica se o token enviado pelo usuario é o mesmo gravado na base de dados
	// caso sejá é redirecionado para uma pagina para trocar de senha
	async validateToken(request, response) {
		// recebendo o email e o token na requisicão
		const { token, user_email } = request.body;

		try {
			// verificando se existe um registro com o email recebido na base de dados
			const [user] = await connection_db("user").where({
				user_email: user_email,
			});

			// caso não exista o registro com o email recebido, é enviado uma mensagem de erro
			if (!user)
				return response.status(400).send({ error: "Usuário não encontrado" });

			// verificando se o token recebido é o mesmo gravado na base de dados
			if (token !== user.password_reset_token)
				return response.status(400).send({ error: "Token inválido" });

			// caso tudo de ok é enviado uma mensagem de token valido
			return response.status(200).send({ mensagem: "Token valid" });
		} catch (err) {
			// caso de algum erro (token ou email não enviado na requisicão por exempleo)
			// é enviado uma mensagem de erro generica
			return response
				.status(400)
				.send({ error: "Falha na requisição, tente novamente." });
		}
	},

	// funcão responsavel por enviar um e-mail com um token para o usuario que deseja recuperar uma senha
	// forgotPassword - é a primeira funcão a ser chamada no processo de recuperacão de senhas
	async forgotPassword(request, response) {
		// para recuperar uma senha é necessario que seja enviado um e-mail para a recuperação.
		// é preciso verificar se o email passado pela requisição exista na base de dados e caso exista
		// é enviado um e-mail com um token de recuperação de senha.
		const { user_email } = request.body;

		try {
			// verifico se o email recebido pelo corpo da requisicão existe na base de dados
			const [user] = await connection_db("user").where({
				user_email: user_email,
			});

			// verificação para ver se a consulta retornou algum usuario
			// caso o e-mail não exista na base de dados, retorna uma mensagem para o front-end
			if (!user)
				return response.status(400).json({
					errorTitle: "Nenhum usuário encontrado",
					errorMessage:
						"O e-mail inserido não parece pertencer a uma conta. Verifique o e-mail digitado e tente novamente",
				});

			// caso o e-mail exista, é realziado a geração de um token
			const token = crypto.randomBytes(8).toString("hex");

			// criação de uma data de exipiração para o token (1 hr)
			var now = new Date();
			now.setHours(now.getHours() + 1);

			// incluindo o token e a data de expiracão na base de dados
			await connection_db("user").where({ user_id: user.user_id }).update({
				password_reset_token: token,
				password_reset_expires: now,
			});

			// enviando o email para o usuario com o token para redefinir a senha
			mailer.sendMail(
				{
					to: user_email,
					from: "murilo_879@hotmail.com",
					template: "auth/forgot_password",
					context: { token },
				},
				(err) => {
					if (err) return response.status(400).send({ error: err });
					return response.send({ mensagem: "E-mail enviado com sucesso" });
				}
			);
		} catch (err) {
			return response.status(400).send({
				error: err,
				mensagem: "Falha no envio do E-mail, por favor tente novamente.",
			});
		}
	},

	// funcão para resetar a senha de um usuario
	// resetPassword - é a segunda funcão a ser chamada no processo de recuperacão de senhas
	// recebe um email, token e uma nova senha como parametros
	async resetPassword(request, response) {
		// para resetar a senha do usuario, precisamos de um e-mail que exista na base de dados,
		// um token de recuperação e a nova senha.
		const { user_email, token, new_password } = request.body;

		try {
			// verificando se o e-mail recebido pela requisicão existe na base de dados,
			const [user] = await connection_db("user")
				.where({ user_email: user_email })
				.select("user_email", "password_reset_token", "password_reset_expires");

			// verificação para ver se a consulta retornou algum usuario
			// caso o e-mail não exista na base de dados, retorna uma mensagem para o front-end
			if (!user)
				return response.status(400).send({ error: "Usuario não encontrado" });

			// verificando se o token passado pela requisição é valido
			// caso não seja valido, uma mensagem é enviada
			if (token !== user.password_reset_token)
				return response.status(400).send({ error: "Token inválido" });

			// como os token tem um tempo para expirar, necessitamos pegar a hora atual
			const now = new Date();

			// verificando se a hora atual está dentro do tempo de vida do token
			if (now > user.password_reset_expires)
				return response
					.status(400)
					.send({ error: "O token expirou, por favor gere um novo" });

			// pegando a data e a hora atual para fazer o update na coluna "update_at"
			let updated_at = new Date();

			// criptografando a senha antes de salvar no DB
			const user_password = await bcrypt.hashSync(new_password, 10);

			// inserindo a nova senha na base de dados
			await connection_db("user")
				.where({ user_email: user_email })
				.update({ user_password: user_password, updated_at: updated_at });

			return response
				.status(200)
				.send({ mensagem: "A senha foi alterada com sucesso!" });
		} catch (err) {
			response
				.status(400)
				.send({ error: "Cannot reset password, try again", err: err });
		}
	},
};
