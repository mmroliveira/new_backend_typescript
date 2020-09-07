const validator = require("validator");
const connection_db = require("../database/connection_db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { Console } = require("console");

async function insetUser(request, response) {
	let {
		user_id,
		user_name,
		user_phone,
		user_email,
		user_password_1,
		user_password_2,
		user_password,
	} = request.body;
    // console.log(user_phone);
    user_phone = user_phone.replace(/\D+/g, '')
    // console.log(user_phone);

    user_phone = [user_phone.slice(0, 0), '55', user_phone.slice(0)].join('');
    console.log(user_phone);
    
    
	let validate_data = {
		user_validate: true,
		user_name: "",
		user_phone: "",
		user_email: "",
		user_password_1: "",
		user_password_2: "",
	};

	// validação do nome
	if (!validator.isEmpty(user_name))
		if (validator.isAlpha(user_name)) {
			validate_data["user_name"] = "OK";
		} else {
			validate_data["user_name"] = "O campo 'nome' deve conter apenas letras.";
			validate_data["user_validate"] = false;
		}
	else {
		validate_data["user_name"] = "O campo 'nome' não pode ser vazio.";
		validate_data["user_validate"] = false;
	}

	// validando telefone
	if (!validator.isEmpty(user_phone))
		if (validator.isMobilePhone(user_phone, ["pt-BR"], {strictMode: false}))
			validate_data["user_phone"] = "OK";
		else {
			validate_data["user_phone"] = "Telefone inválido";
			validate_data["user_validate"] = false;
		}
	else {
		validate_data["user_phone"] = "O campo 'telefone' não pode ser vazio";
		validate_data["user_validate"] = false;
	}

	// validando email
	if (!validator.isEmpty(user_email))
		if (validator.isEmail(user_email)) validate_data["user_email"] = "OK";
		else {
			validate_data["user_email"] = "E-mail inválido";
			validate_data["user_validate"] = false;
		}
	else {
		validate_data["user_email"] = "O campo 'email' não pode ser vazio";
		validate_data["user_validate"] = false;
	}

	// validando senhas
	if (
		!validator.isEmpty(user_password_1) &&
		!validator.isEmpty(user_password_2)
	)
		if (validator.equals(user_password_1, user_password_2)) {
			validate_data["user_password_1"] = "OK";
			validate_data["user_password_2"] = "OK";
			user_password = user_password_1;
		} else {
			validate_data["user_password_1"] = "As senhas não batem";
			validate_data["user_password_2"] = "As senhas não batem";
			validate_data["user_validate"] = false;
		}
	else {
		validate_data["user_password_1"] = "O campo 'senha' não pode ser vazio";
		validate_data["user_password_2"] = "O campo 'senha' não pode ser vazio";
		validate_data["user_validate"] = false;
	}

	// verificando se todos os campos foram validados
	if (validate_data["user_validate"] === true) {
		// gerando uma ID para o novo usuario
		user_id = crypto.randomBytes(4).toString("HEX");

		// criptografando a senha antes de salvar no DB
		user_password = await bcrypt.hashSync(user_password, 10);

		// salvando os dados no DB
		try {
			await connection_db("user").insert({
				user_id,
				user_name,
				user_phone,
				user_email,
				user_password,
			});

			return response
				.status(201)
				.send({ mensagem: "Cadastro realizado com sucesso" });
		} catch (err) {
            console.log(validate_data);
			return response.status(500).send({
				mensagem: "Falha no cadastro do usuário, tente novamente.",
				erro: err,
			});
		}
	} else {
        console.log('e -> ', validate_data);
		return response.status(500).send({
			mensagem: "Um ou mais campos não foram validados",
			json: validate_data,
		});
	}
}

// Controller revisado depois das alteracões
module.exports = {
	async register(request, response) {
		response = await insetUser(request, response);

		return response;
	},

	async listUser(request, response) {
		try {
			const user = await connection_db("user");

			return response.send({ user: user });
		} catch (err) {
			return response.status(500).send({ error: err });
		}
	},

	async getUser(request, response) {
		const { user_id } = request.params;

		try {
			const [user] = await connection_db("user")
				.where({ user_id: user_id })
				.select("user_name", "user_email", "user_phone", "user_password");

			return response.status(200).send({ user });
		} catch (err) {
			return response.status(400).send({ error: err });
		}
	},
};
