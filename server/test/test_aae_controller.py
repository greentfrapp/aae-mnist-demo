# coding: utf-8

from __future__ import absolute_import

from swagger_server.models.datasets import Datasets
from swagger_server.models.latent_points import LatentPoints
from swagger_server.models.pca_points import PcaPoints
from . import BaseTestCase
from six import BytesIO
from flask import json


class TestAaeController(BaseTestCase):
    """ AaeController integration test stubs """

    def test_get_models(self):
        """
        Test case for get_models

        Retrieve list of models
        """
        response = self.client.open('/v0.1/get_models',
                                    method='GET')
        self.assert200(response, "Response body is : " + response.data.decode('utf-8'))

    def test_is_model_loaded(self):
        """
        Test case for is_model_loaded

        Checks if model is loaded
        """
        response = self.client.open('/v0.1/is_model_loaded',
                                    method='GET')
        self.assert200(response, "Response body is : " + response.data.decode('utf-8'))

    def test_latent2data(self):
        """
        Test case for latent2data

        Converts latent dimension to PCA dimension and images
        """
        points = LatentPoints()
        response = self.client.open('/v0.1/latent2data',
                                    method='POST',
                                    data=json.dumps(points),
                                    content_type='application/json')
        self.assert200(response, "Response body is : " + response.data.decode('utf-8'))

    def test_load_model(self):
        """
        Test case for load_model

        Load a model
        """
        query_string = [('model', 'model_example')]
        response = self.client.open('/v0.1/load_model',
                                    method='GET',
                                    content_type='application/json',
                                    query_string=query_string)
        self.assert200(response, "Response body is : " + response.data.decode('utf-8'))

    def test_pca2data(self):
        """
        Test case for pca2data

        Converts PCA dimension to latent dimension and images
        """
        points = PcaPoints()
        response = self.client.open('/v0.1/pca2data',
                                    method='POST',
                                    data=json.dumps(points),
                                    content_type='application/json')
        self.assert200(response, "Response body is : " + response.data.decode('utf-8'))

    def test_plot_mnist(self):
        """
        Test case for plot_mnist

        Plot points from the MNIST set
        """
        query_string = [('n_data', 3.4)]
        response = self.client.open('/v0.1/plot_mnist_data',
                                    method='GET',
                                    content_type='application/json',
                                    query_string=query_string)
        self.assert200(response, "Response body is : " + response.data.decode('utf-8'))


if __name__ == '__main__':
    import unittest
    unittest.main()
