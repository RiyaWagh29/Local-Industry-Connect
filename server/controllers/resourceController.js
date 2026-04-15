import Resource from '../models/Resource.js';
import { config } from '../config/env.js';
import { uploadBufferToSupabase } from '../services/storageService.js';

// @desc    Get all resources
// @route   GET /api/resources
// @access  Private
export const getResources = async (req, res) => {
  try {
    const { communityId } = req.query;
    const filter = communityId ? { community_id: communityId } : {};
    const resources = await Resource.find(filter)
      .populate('sharedBy', 'name role')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: resources });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Share a resource
// @route   POST /api/resources
// @access  Private
export const shareResource = async (req, res) => {
  try {
    const parseLocalized = (value) => {
      if (typeof value !== 'string') return value;
      try {
        return JSON.parse(value);
      } catch {
        return { en: value, mr: value };
      }
    };

    const { type, url, tags, communityId } = req.body;
    const title = parseLocalized(req.body.title);
    const description = parseLocalized(req.body.description);
    const uploadedFile = req.file
      ? await uploadBufferToSupabase({
          bucket: config.resourceBucket,
          file: req.file,
          folder: 'resources',
        })
      : null;
    const uploadedFileUrl = uploadedFile?.publicUrl || null;
    const resourceUrl = uploadedFileUrl || url;

    if (!resourceUrl) {
      return res.status(400).json({ success: false, message: 'A link or file is required' });
    }

    const resource = await Resource.create({
      title,
      description,
      type,
      url: resourceUrl,
      storagePath: uploadedFile?.path || '',
      tags,
      sharedBy: req.user._id,
      community_id: communityId || null,
    });

    res.status(201).json({ success: true, data: resource });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
