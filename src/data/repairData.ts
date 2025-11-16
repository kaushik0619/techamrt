export interface DeviceModel {
  id: string;
  name: string;
  imageUrl: string;
}

export interface Brand {
  id: string;
  name: string;
  logoUrl: string;
  models: DeviceModel[];
}

export const repairBrands: Brand[] = [
  {
    id: 'apple',
    name: 'Apple',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
    models: [
      { id: 'iphone-15-pro', name: 'iPhone 15 Pro', imageUrl: 'https://images.pexels.com/photos/18463581/pexels-photo-18463581.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 'iphone-15', name: 'iPhone 15', imageUrl: 'https://images.pexels.com/photos/18332331/pexels-photo-18332331.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 'iphone-14-pro', name: 'iPhone 14 Pro', imageUrl: 'https://images.pexels.com/photos/13684853/pexels-photo-13684853.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 'iphone-14', name: 'iPhone 14', imageUrl: 'https://images.pexels.com/photos/1294886/pexels-photo-1294886.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 'iphone-13', name: 'iPhone 13', imageUrl: 'https://images.pexels.com/photos/10403900/pexels-photo-10403900.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 'iphone-se', name: 'iPhone SE', imageUrl: 'https://images.pexels.com/photos/4065624/pexels-photo-4065624.jpeg?auto=compress&cs=tinysrgb&w=400' },
    ],
  },
  {
    id: 'samsung',
    name: 'Samsung',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg',
    models: [
      { id: 'galaxy-s24-ultra', name: 'Galaxy S24 Ultra', imageUrl: 'https://images.pexels.com/photos/20492307/pexels-photo-20492307.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 'galaxy-s24', name: 'Galaxy S24', imageUrl: 'https://images.pexels.com/photos/15598183/pexels-photo-15598183.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 'galaxy-z-fold-5', name: 'Galaxy Z Fold 5', imageUrl: 'https://images.pexels.com/photos/1786433/pexels-photo-1786433.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 'galaxy-z-flip-5', name: 'Galaxy Z Flip 5', imageUrl: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 'galaxy-a54', name: 'Galaxy A54', imageUrl: 'https://images.pexels.com/photos/47261/samsung-mobile-phone-samsung-galaxy-47261.jpeg?auto=compress&cs=tinysrgb&w=400' },
    ],
  },
  {
    id: 'google',
    name: 'Google',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg',
    models: [
        { id: 'pixel-8-pro', name: 'Pixel 8 Pro', imageUrl: 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=400' },
        { id: 'pixel-8', name: 'Pixel 8', imageUrl: 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=400' },
        { id: 'pixel-fold', name: 'Pixel Fold', imageUrl: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=400' },
        { id: 'pixel-7a', name: 'Pixel 7a', imageUrl: 'https://images.pexels.com/photos/1647976/pexels-photo-1647976.jpeg?auto=compress&cs=tinysrgb&w=400' },
    ]
  },
  {
    id: 'oneplus',
    name: 'OnePlus',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/OnePlus_logo.svg',
    models: [
        { id: 'oneplus-12', name: 'OnePlus 12', imageUrl: 'https://images.pexels.com/photos/1478276/pexels-photo-1478276.jpeg?auto=compress&cs=tinysrgb&w=400' },
        { id: 'oneplus-open', name: 'OnePlus Open', imageUrl: 'https://images.pexels.com/photos/1036804/pexels-photo-1036804.jpeg?auto=compress&cs=tinysrgb&w=400' },
        { id: 'oneplus-11', name: 'OnePlus 11', imageUrl: 'https://images.pexels.com/photos/1261820/pexels-photo-1261820.jpeg?auto=compress&cs=tinysrgb&w=400' },
        { id: 'oneplus-nord-3', name: 'OnePlus Nord 3', imageUrl: 'https://images.pexels.com/photos/2769274/pexels-photo-2769274.jpeg?auto=compress&cs=tinysrgb&w=400' },
    ]
  },
];
