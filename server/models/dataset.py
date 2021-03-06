# coding: utf-8

from __future__ import absolute_import
from server.models.img_points import ImgPoints
from server.models.latent_points import LatentPoints
from server.models.pca_points import PcaPoints
from .base_model_ import Model
from datetime import date, datetime
from typing import List, Dict
from ..util import deserialize_model


class Dataset(Model):
    """
    NOTE: This class is auto generated by the swagger code generator program.
    Do not edit the class manually.
    """
    def __init__(self, label: str=None, pca_points: PcaPoints=None, latent_points: LatentPoints=None, img_points: ImgPoints=None):
        """
        Dataset - a model defined in Swagger

        :param label: The label of this Dataset.
        :type label: str
        :param pca_points: The pca_points of this Dataset.
        :type pca_points: PcaPoints
        :param latent_points: The latent_points of this Dataset.
        :type latent_points: LatentPoints
        :param img_points: The img_points of this Dataset.
        :type img_points: ImgPoints
        """
        self.swagger_types = {
            'label': str,
            'pca_points': PcaPoints,
            'latent_points': LatentPoints,
            'img_points': ImgPoints
        }

        self.attribute_map = {
            'label': 'label',
            'pca_points': 'pca_points',
            'latent_points': 'latent_points',
            'img_points': 'img_points'
        }

        self._label = label
        self._pca_points = pca_points
        self._latent_points = latent_points
        self._img_points = img_points

    @classmethod
    def from_dict(cls, dikt) -> 'Dataset':
        """
        Returns the dict as a model

        :param dikt: A dict.
        :type: dict
        :return: The dataset of this Dataset.
        :rtype: Dataset
        """
        return deserialize_model(dikt, cls)

    @property
    def label(self) -> str:
        """
        Gets the label of this Dataset.

        :return: The label of this Dataset.
        :rtype: str
        """
        return self._label

    @label.setter
    def label(self, label: str):
        """
        Sets the label of this Dataset.

        :param label: The label of this Dataset.
        :type label: str
        """

        self._label = label

    @property
    def pca_points(self) -> PcaPoints:
        """
        Gets the pca_points of this Dataset.

        :return: The pca_points of this Dataset.
        :rtype: PcaPoints
        """
        return self._pca_points

    @pca_points.setter
    def pca_points(self, pca_points: PcaPoints):
        """
        Sets the pca_points of this Dataset.

        :param pca_points: The pca_points of this Dataset.
        :type pca_points: PcaPoints
        """

        self._pca_points = pca_points

    @property
    def latent_points(self) -> LatentPoints:
        """
        Gets the latent_points of this Dataset.

        :return: The latent_points of this Dataset.
        :rtype: LatentPoints
        """
        return self._latent_points

    @latent_points.setter
    def latent_points(self, latent_points: LatentPoints):
        """
        Sets the latent_points of this Dataset.

        :param latent_points: The latent_points of this Dataset.
        :type latent_points: LatentPoints
        """

        self._latent_points = latent_points

    @property
    def img_points(self) -> ImgPoints:
        """
        Gets the img_points of this Dataset.

        :return: The img_points of this Dataset.
        :rtype: ImgPoints
        """
        return self._img_points

    @img_points.setter
    def img_points(self, img_points: ImgPoints):
        """
        Sets the img_points of this Dataset.

        :param img_points: The img_points of this Dataset.
        :type img_points: ImgPoints
        """

        self._img_points = img_points

