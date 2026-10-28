const Resource = require('../models/Resource');
const { logAction } = require('../services/auditService');

// @desc    Get all resources
// @route   GET /api/resources
// @access  Public
const getAllResources = async (req, res, next) => {
  try {
    const { category, type, status } = req.query;

    const query = {};
    if (category) query.category = category;
    if (type) query.type = type;
    if (status) query.status = status;

    const resources = await Resource.find(query).populate('installedIn', 'classroomId name');

    res.json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single resource by ID
// @route   GET /api/resources/:id
// @access  Public
const getResourceById = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id).populate('installedIn', 'classroomId name');
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }
    res.json({ success: true, data: resource });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new resource
// @route   POST /api/resources
// @access  Private (Admin only)
const createResource = async (req, res, next) => {
  try {
    const { resourceId, name, category, type, totalQuantity, availableQuantity, status, description, installedIn } = req.body;

    if (!resourceId || !name || !category || totalQuantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide resourceId, name, category, and totalQuantity.'
      });
    }

    const existing = await Resource.findOne({ resourceId: resourceId.toUpperCase().trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Resource with ID '${resourceId}' already exists.`
      });
    }

    const resource = await Resource.create({
      resourceId: resourceId.toUpperCase().trim(),
      name: name.trim(),
      category,
      type: type || 'portable',
      totalQuantity: Number(totalQuantity),
      availableQuantity: availableQuantity !== undefined ? Number(availableQuantity) : Number(totalQuantity),
      status: status || 'available',
      description: description || '',
      installedIn: installedIn || null
    });

    await logAction(req.user, 'RESOURCE_CREATED', { resourceId: resource.resourceId, name: resource.name }, req);

    res.status(201).json({
      success: true,
      message: 'Resource added successfully.',
      data: resource
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update resource
// @route   PUT /api/resources/:id
// @access  Private (Admin only)
const updateResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    const { name, category, type, totalQuantity, availableQuantity, status, description, installedIn } = req.body;

    if (name) resource.name = name.trim();
    if (category) resource.category = category;
    if (type) resource.type = type;
    if (totalQuantity !== undefined) resource.totalQuantity = Number(totalQuantity);
    if (availableQuantity !== undefined) resource.availableQuantity = Number(availableQuantity);
    if (status) resource.status = status;
    if (description !== undefined) resource.description = description.trim();
    if (installedIn !== undefined) resource.installedIn = installedIn || null;

    await resource.save();

    await logAction(req.user, 'RESOURCE_UPDATED', { resourceId: resource.resourceId, updates: req.body }, req);

    res.json({
      success: true,
      message: 'Resource updated successfully.',
      data: resource
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private (Admin only)
const deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    await Resource.findByIdAndDelete(req.params.id);

    await logAction(req.user, 'RESOURCE_DELETED', { resourceId: resource.resourceId, name: resource.name }, req);

    res.json({
      success: true,
      message: 'Resource deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource
};
