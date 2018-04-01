#!/usr/bin/env python3

import connexion
from .encoder import JSONEncoder
from flask_cors import CORS, cross_origin


if __name__ == '__main__':
    app = connexion.App(__name__, specification_dir='./swagger/')
    app.app.json_encoder = JSONEncoder
    app.add_api('swagger.yaml', arguments={'title': 'API for Adversarial Autoencoders demonstration'})
    cors = CORS(app.app)
    app.run(port=8081)
