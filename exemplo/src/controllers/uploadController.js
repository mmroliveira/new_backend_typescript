const validator = require("validator");
const connection_db = require("../database/connection_db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const uuid = require("uuid/v1");

const azureConfig = require("../config/azureConfig");

const fs = require("fs");

const azure = require("azure-storage");

const {
	BlobServiceClient,
	StorageSharedKeyCredential,
} = require("@azure/storage-blob");
const { response } = require("express");
const { type } = require("os");

module.exports = {
	async uploadCategory(request, response) {
		console.log(request.file);
		const { category_name } = request.params;

		// carregando a imagem que foi salva pelo multer
		const category_img = fs.readFileSync(request.file.path);

		// filename utilizado para não confundir
		const filename = request.file.filename;

		// fazendo a conexão com o azure
		const blobSvc = azure.createBlobService(
			"DefaultEndpointsProtocol=https;AccountName=murilo879;AccountKey=I/lvLnUAANjJRi4/Fob+ypBKEmoyBNMxxjNbtasAWmvJRZrA3re3FS4uCnI8z+nyNkvfAC4JgE5/9nV2mRn6ng==;EndpointSuffix=core.windows.net"
		);

		// fazendo o upload da imagem no azure
		await blobSvc.createBlockBlobFromText(
			category_name,
			filename,
			category_img,
			{
				contentType: request.file.mimetype,
			},
			function (error, result, response) {
				if (error) {
					filename = "default.png";
				}
			}
		);

		// construindo a url da imagem que foi gerada pelo azure
		const category_image_url = `https://murilo879.blob.core.windows.net/${category_name}/${filename}`;

		// gerando as colunas do db
		const category_id = request.file.filename;
		const category_original_image_name = request.file.originalname;
		const category_image_path = request.file.path;

		await connection_db("category").insert({
			category_id,
			category_name,
			category_original_image_name,
			category_image_path,
			category_image_url,
		});

		return response.status(200).json("e ae");
	},

	async uploadProduct(request, response) {
		// pego o nome da categoria para saber em qual pasta salvar
		const category_name = request.query["category_name"];

		let {
			product_name,
			product_value,
			product_description,
			product_additional,
		} = request.body;

		// carregando a imagem que foi salva pelo multer
		const product_img = fs.readFileSync(request.file.path);

		// filename utilizado para não confundir
		const filename = request.file.filename;

		// fazendo a conexão com o azure
		const blobSvc = azure.createBlobService(
			"DefaultEndpointsProtocol=https;AccountName=murilo879;AccountKey=I/lvLnUAANjJRi4/Fob+ypBKEmoyBNMxxjNbtasAWmvJRZrA3re3FS4uCnI8z+nyNkvfAC4JgE5/9nV2mRn6ng==;EndpointSuffix=core.windows.net"
		);

		// fazendo o upload da imagem no azure
		await blobSvc.createBlockBlobFromText(
			category_name,
			filename,
			product_img,
			{
				contentType: request.file.mimetype,
			},
			function (error, result, response) {
				if (error) {
					filename = "default.png";
				}
			}
		);
		console.log("eeeee");
		// construindo a url da imagem que foi gerada pelo azure
		const product_image_url = `https://murilo879.blob.core.windows.net/${category_name}/${filename}`;
		const product_image_path = request.file.path;
		const product_id = request.file.filename;

		const [category_id] = await connection_db("category")
			.where({ category_name: category_name })
			.select("category_id");

		const fk_category_id = category_id.category_id;

		product_additional = JSON.parse(product_additional);

		for (var prop in product_additional) {
			product_additional[prop].additional_id = crypto
				.randomBytes(4)
				.toString("HEX");
			console.log(
				"product_additional." +
					prop +
					" = " +
					product_additional[prop].additional_id
			);
		}

		product_additional = JSON.stringify(product_additional);

		await connection_db("products").insert({
			product_id,
			product_name,
			product_description,
			product_value,
			product_image_path,
			product_image_url,
			fk_category_id,
			product_additional,
		});

		return response.status(200).json("e ae");
	},

	async getProducts(request, response) {
		const { category } = request.query;

		const [count] = await connection_db("products").count();

		const products = await connection_db("products").where({
			fk_category_id: category,
		});

		response.header("X-Product-Count", count.count);
		return response.json(products);
	},

	async getCategory(request, response) {
		const { page } = request.query;

		const [count] = await connection_db("category").count();

		const category = await connection_db("category")
			.limit(5)
			.offset((page - 1) * 5);

		response.header("X-Total-Count", count.count);
		return response.json(category);
	},

	async getAllCategory(request, response) {
		const category = await connection_db("category");
		console.log(category);
		return response.json(category);
	},



	async testAzure(request, response) {
		// carregando as keys de conexão
		const AZURE_STORAGE_CONNECTION_STRING =
			azureConfig.AZURE_STORAGE_CONNECTION_STRING;

		// criando o objeto BlobServiceClient que será usado para criar um client de contêiner
		const blobServiceClient = await BlobServiceClient.fromConnectionString(
			AZURE_STORAGE_CONNECTION_STRING
		);

		const blobSvc = await azure.createBlobService(
			AZURE_STORAGE_CONNECTION_STRING
		);
		const containerName = "cavalos";

		await blobSvc.createContainerIfNotExists(
			containerName,
			{ publicAccessLevel: "blob" },
			function (error, result, response) {
				if (!error) {
					console.log("result -> ", result);
				} else {
					console.log("error -> ", error);
				}
			}
		);

		return response.status(200).json("e ae");
	},
};
