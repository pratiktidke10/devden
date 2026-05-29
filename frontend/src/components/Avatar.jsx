

function Avatar({ initials, color, imageUrl, size = 'md' }) {

  const sizes = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-20 h-20 text-2xl',
  }

  // If user has uploaded a profile picture, show it
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={initials}
        className={`${sizes[size]} rounded-full object-cover shrink-0`}
      />
    )
  }

  // Otherwise show initials with background color
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold text-white shrink-0`}
      style={{ backgroundColor: color || '#1f6feb' }}
    >
      {initials}
    </div>
  )
}

export default Avatar