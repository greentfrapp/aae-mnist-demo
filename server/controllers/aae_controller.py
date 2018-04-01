import connexion
from server.models.datasets import Datasets
from server.models.dataset import Dataset
from server.models.latent_points import LatentPoints
from server.models.pca_points import PcaPoints
from server.models.pca_point import PcaPoint
from datetime import date, datetime
from typing import List, Dict
from six import iteritems
from ..util import deserialize_date, deserialize_datetime

import os
import random
import tensorflow as tf
import numpy as np
import datetime
from sklearn.decomposition import PCA

from server.controllers.adversarialautoencoder import AdversarialAutoencoder


def pca2latent(pca_points):
    latent_points = []
    for point in pca_points.points:
        z = _pca.inverse_transform([[point.x,point.y]])
        variants = _model.pca_inverse_variant(_pca, z[0], n=4, min_mag=1, max_mag=2)
        z_variants = []
        for variant in variants:
            z_variants.append(variant.tolist())
        latent_points.append(z_variants)
    return latent_points

def latent2img(latent_points, pca=False):
    image_points = []
    if not pca:
        for point in latent_points:
            z = np.reshape(point, (1, _model.z_dim))
            bw_array = _model.sess.run(_model.sample_image, feed_dict={_model.sample_latent_vector: z})
            image_points.append(bw2rgba(bw_array[0].tolist()))
    else:
        for z_variants in latent_points:
            bw_arrays = []
            for variant in z_variants:
                z = np.reshape(variant, (1, _model.z_dim))
                bw_array = _model.sess.run(_model.sample_image, feed_dict={_model.sample_latent_vector: z})
                bw_arrays.append(bw_array[0].tolist())
            combined_bw_array = []
            for row_no in range(2):
                for sub_row_no in range(28):
                    for col_no in range(2):
                        for sub_col_no in range(28):
                            combined_bw_array.append(bw_arrays[2 * row_no + col_no][28 * sub_row_no + sub_col_no])
            image_points.append(bw2rgba(combined_bw_array))
    return image_points

def latent2pca(latent_points):
    points = _pca.transform(latent_points)
    pca_points = PcaPoints.from_dict({'points':[]})
    for point in points:
        pca_points.points.append({'x': point[0], 'y': point[1]})
    return pca_points

def bw2rgba(bw_array):
    rgba_array = np.zeros(len(bw_array) * 4)
    for i,pixel in enumerate(bw_array):
        rgba_array[i * 4 + 3] = 255.0 * pixel
    return rgba_array.tolist()

def get_models():
    """
    Retrieve list of models
    Retrieves a list of models from the Results directory

    :rtype: List[str]
    """
    return os.listdir("./server/assets/models")

def is_model_loaded():
    """
    Checks if model is loaded
    Returns a boolean for if model is loaded

    :rtype: bool
    """
    if _model is None:
        return False
    return True

def latent2data(points=None):
    """
    Converts latent dimension to PCA dimension and images
    Converts points in the latent dimension to PCA dimension for visualization
    :param points: 
    :type points: dict | bytes

    :rtype: Datasets
    """
    if connexion.request.is_json:
        points = LatentPoints.from_dict(connexion.request.get_json())
    dataset = Dataset.from_dict({'label': 'New'})
    dataset.pca_points = latent2pca(points)
    dataset.img_points = latent2img(points)
    dataset.latent_points = points
    return [dataset]


def load_model(model=None):
    """
    Load a model
    Load a model from list of models provided by get_models
    :param model: 
    :type model: str

    :rtype: Datasets
    """
    global _model
    _model = AdversarialAutoencoder(z_dim=8)
    _model.load_last_saved_model(model)

    n_datapoints = 1000
    batch_size = 100
    mnist_data, mnist_labels = _model.mnist.train.next_batch(n_datapoints, shuffle=False)

    n_batch = int(n_datapoints / _model.batch_size)
    batch_no = 0
    all_z = None

    while batch_no < n_batch:

        batch_x = mnist_data[batch_no * _model.batch_size:(batch_no + 1) * _model.batch_size]
        batch_y = mnist_labels[batch_no * _model.batch_size:(batch_no + 1) * _model.batch_size]

        batch_z = _model.sess.run(_model.latent_vector, feed_dict={_model.original_image: batch_x})

        if all_z is None:
            all_z = batch_z
        else:
            all_z = np.concatenate((all_z, batch_z))

        batch_no += 1

    _pca.fit(all_z)
    transformed_z = _pca.transform(all_z)

    datasets = []
    for i in range(10):
        datasets.append(Dataset.from_dict({'label': i, 'pca_points': {'points':[]}, 'latent_points': [], 'img_points': []}))
    for i,z in enumerate(transformed_z):
        label = int(mnist_labels[i].argmax())
        datasets[label].pca_points.points.append({'x': float(z[0]), 'y': float(z[1])})
        datasets[label].latent_points.append(all_z[i].tolist())
        datasets[label].img_points.append(bw2rgba(mnist_data[i]))
    return datasets


def pca2data(points=None):
    """
    Converts PCA dimension to latent dimension and images
    Converts points in the PCA dimension to higher-order latent dimension
    :param points: 
    :type points: dict | bytes

    :rtype: Datasets
    """
    if connexion.request.is_json:
        points = PcaPoints.from_dict(connexion.request.get_json())
    dataset = Dataset.from_dict({'label': 'New'})
    dataset.latent_points = pca2latent(points)
    dataset.pca_points = points
    dataset.img_points = latent2img(dataset.latent_points, pca=True)
    return [dataset]


def plot_mnist(n_data=None):
    """
    Plot points from the MNIST set
    Encodes images from the MNIST set and transform the encodings via PCA
    :param n_data: 
    :type n_data: float

    :rtype: Datasets
    """
    n_datapoints = int(n_data)
    batch_size = 100

    n_datapoints += n_datapoints % batch_size

    mnist_data, mnist_labels = _model.mnist.train.next_batch(n_datapoints, shuffle=False)

    n_batch = int(n_datapoints / _model.batch_size)
    batch_no = 0
    all_z = None

    while batch_no < n_batch:

        batch_x = mnist_data[batch_no * _model.batch_size:(batch_no + 1) * _model.batch_size]
        batch_y = mnist_labels[batch_no * _model.batch_size:(batch_no + 1) * _model.batch_size]

        batch_z = _model.sess.run(_model.latent_vector, feed_dict={_model.original_image: batch_x})

        if all_z is None:
            all_z = batch_z
        else:
            all_z = np.concatenate((all_z, batch_z))

        batch_no += 1

    _pca.fit(all_z)
    transformed_z = _pca.transform(all_z)

    datasets = []
    for i in range(10):
        datasets.append(Dataset.from_dict({'label': i, 'pca_points': {'points':[]}, 'latent_points': [], 'img_points': []}))
    for i,z in enumerate(transformed_z):
        label = int(mnist_labels[i].argmax())
        datasets[label].pca_points.points.append({'x': float(z[0]), 'y': float(z[1])})
        datasets[label].latent_points.append(all_z[i].tolist())
        datasets[label].img_points.append(bw2rgba(mnist_data[i]))

    return datasets

_model = None
_pca = PCA(n_components=2, random_state=1)
