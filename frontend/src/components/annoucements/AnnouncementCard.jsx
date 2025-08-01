import React from 'react';
import PropTypes from 'prop-types';
import { OpenInNew, Download, InfoOutlined } from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || API_BASE_URL.replace(/\/api\/?$/, '');

const AnnouncementCard = ({ announcement }) => {
  /**
   * Constructs a full URL from a potentially relative path
   */
  const constructUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http')
      ? url
      : `${IMAGE_BASE_URL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
  };

  const imageUrl = constructUrl(announcement.imageUrl);
  const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDQ4IDQ4Ij48cmVjdCB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIGZpbGw9IiMyMTI0MzAiIHJ4PSI4Ii8+PHRleHQgeD0iMjQiIHk9IjI2IiBmb250LXNpemU9IjEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjN2E4M2E1IiBmb250LWZhbWlseT0iQXJpYWwiPk5vIElNQTwvdGV4dD48L3N2Zz4=';

  // Process file attachments
  const fileUrls = announcement.files?.map((file, index) => ({
    name: file.name || `File ${index + 1}`,
    url: constructUrl(file.url || file),
    onClick: (e) => {
      e.stopPropagation();
      const downloadUrl = constructUrl(file.url || file);
      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.target = '_blank';
      anchor.download = file.name || '';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    },
  })) || [];

  // Process external links
  const linkUrls = announcement.link?.map((link, index) => ({
    name: link.name || `Link ${index + 1}`,
    url: constructUrl(link.url || link),
    onClick: (e) => {
      e.stopPropagation();
      window.open(constructUrl(link.url || link), '_blank');
    },
  })) || [];

  // Format the creation date
  const formattedDate = new Date(announcement.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="max-w-[600px] mx-auto px-1 py-4">
      <div className="flex flex-col space-y-3">
        <div className="bg-slate-800 rounded-lg border border-slate-700/50 overflow-hidden shadow">
          {/* Header with gradient and image */}
          {announcement.header && (
            <div
              className=" px-3 text-sm font-medium bg-gradient-to-r from-teal-600/30 to-teal-800/30 border-b border-teal-400/20 flex items-center space-x-3"
              style={announcement.headerColor ? { 
                background: `linear-gradient(to right, ${announcement.headerColor}30, ${announcement.headerColor}50)`,
                borderBottomColor: `${announcement.headerColor}20`,
              } : {}}
            >
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={announcement.title}
                  className="w-8 h-8 object-cover rounded border border-slate-700/50"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = fallbackImage;
                  }}
                />
              )}
              <div className="flex items-center space-x-2">
                <span>{announcement.title}</span>
              </div>
            </div>
          )}

          <div className="p-3">
            {/* Title (when no header) */}
            {!announcement.header && (
              <div className="flex items-start space-x-3 mb-3">
                {imageUrl && (
                  <div className="flex-shrink-0">
                    <img
                      src={imageUrl}
                      alt={announcement.title}
                      className="w-10 h-10 object-cover rounded border border-slate-700/50"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = fallbackImage;
                      }}
                    />
                  </div>
                )}
                <h3 className="text-base font-semibold text-white">
                  {announcement.title}
                </h3>
              </div>
            )}

            {/* Content */}
            <div className="text-sm text-slate-300 mb-3 bg-slate-900/30 rounded p-6 border border-slate-700/30">
              <div className="space-y-2">
                {announcement.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="text-justify first:mt-0 last:mb-0">
                    {paragraph || <br />}
                  </p>
                ))}
              </div>
            </div>

            {/* Attachments - Compact Version */}
            {(linkUrls.length > 0 || fileUrls.length > 0) && (
              <div className="mb-2">
                <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-2">Attachments</h4>
                <div className="flex flex-wrap gap-2">
                  {linkUrls.map((link, idx) => (
                    <Tooltip key={idx} title="Open link" arrow placement="top">
                      <button
                        onClick={link.onClick}
                        className="text-xs text-white/90 px-2 py-1 border border-slate-700 rounded flex items-center hover:border-teal-400 hover:bg-teal-400/10 transition-colors"
                      >
                        <OpenInNew className="!w-3 !h-3 mr-1.5 text-teal-400" />
                        <span className="truncate max-w-[120px]">{link.name}</span>
                      </button>
                    </Tooltip>
                  ))}
                  
                  {fileUrls.map((file, idx) => (
                    <Tooltip key={idx} title="Download file" arrow placement="top">
                      <button
                        onClick={file.onClick}
                        className="text-xs text-white/90 px-2 py-1 border border-slate-700 rounded flex items-center hover:border-teal-400 hover:bg-teal-400/10 transition-colors"
                      >
                        <Download className="!w-3 !h-3 mr-1.5 text-teal-400" />
                        <span className="truncate max-w-[120px]">{file.name}</span>
                      </button>
                    </Tooltip>
                  ))}
                </div>
              </div>
            )}

            {/* Date */}
            <div className="text-xs text-slate-500 text-right">
              {formattedDate}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

AnnouncementCard.propTypes = {
  announcement: PropTypes.shape({
    header: PropTypes.bool,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    imageUrl: PropTypes.string,
    headerColor: PropTypes.string,
    files: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          url: PropTypes.string,
          name: PropTypes.string,
        }),
      ])
    ),
    link: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          url: PropTypes.string,
          name: PropTypes.string,
        }),
      ])
    ),
    createdAt: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
    ]).isRequired,
  }).isRequired,
};

export default AnnouncementCard;