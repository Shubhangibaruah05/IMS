from rest_framework import serializers

from .models import Part, PartCategory, PartParameter


class ParameterSerializer(serializers.ModelSerializer):
    """ Serializer for a PartParameter
    """

    class Meta:
        model = PartParameter
        fields = ('pk',
                  'name',
                  'value',
                  'units')


class PartDetailSerializer(serializers.ModelSerializer):
    """ Serializer for complete detail information of a part.
    Used when displaying all details of a single component.
    """

    params = ParameterSerializer(source='parameters', many=True)

    class Meta:
        model = Part
        fields = ('pk',
                  'name',
                  'IPN',
                  'description',
                  'category',
                  'stock',
                  'params')


class PartBriefSerializer(serializers.ModelSerializer):
    """ Serializer for displaying overview of a part.
    Used e.g. for displaying list of parts in a category.
    """

    class Meta:
        model = Part
        fields = ('pk',
                  'name',
                  'IPN',
                  'description',
                  'category',
                  'stock')


class PartCategoryBriefSerializer(serializers.ModelSerializer):

    class Meta:
        model = PartCategory
        fields = ('pk',
                  'name',
                  'description')


class PartCategoryDetailSerializer(serializers.ModelSerializer):

    # List of parts in this category
    parts = PartBriefSerializer(many=True)

    # List of child categories under this one
    children = PartCategoryBriefSerializer(many=True)

    class Meta:
        model = PartCategory
        fields = ('pk',
                  'name',
                  'description',
                  'parent',
                  'path',
                  'children',
                  'parts')
