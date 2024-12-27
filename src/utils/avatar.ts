const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';

export const getAvatarUrl = (url: string | null | undefined): string => {
  if (!url || url.trim() === '') {
    return DEFAULT_AVATAR;
  }
  return url;
};