#Astro Commerce

adalah sebuah e-commerce frontend yang terdiri dari 2 fitur utama yaitu

1. store-front
2. dashboard

masing - masing fitur akan di handle oleh satu backend yaitu fiber-api.

teknologi yang akan di gunakan:

- typescript
- tailwind css
- zustand ( untuk state management )
- shadcn ui
- lucide icon
- date-fns
- astro react
- jwt
- zod validator

schema database ( tolong untuk mengacu pada model fiber-ap models ):

- user
  - id
  - name
  - email
  - password
  - role
  - created_at
  - updated_at
- product
  - id
  - name
  - price
  - stock
  - created_at
  - updated_at
- category
  - id
  - name
  - created_at
  - updated_at
  - product_id

fitur

- landing page storefront
  - header ( logo , cart , profile , signin , register )
  - footer ( link to pages, social media )
  - product card ( image, name, price, add to cart button )
  - product detail page ( image, name, price, description, stock, category ) + SEO
  - search bar
  - filter by category
  - cart page ( add, remove, update quantity )
  - checkout page
  - profile page
  - signin page
  - register page
  - protected route /home
  - role
    - admin ( di dashboard )
    - user ( di storefront )
- dashboard
  - header ( logo , cart , profile , signin , register )
  - footer ( link to pages, social media )
  - product card ( image, name, price, add to cart button )
  - product management page ( add, edit, delete, upload 1 image )
  - category management page ( add, edit, delete )
  - user management page ( add, edit, delete )
  - search bar
  - filter by category
  - cart page ( add, remove, update quantity )
  - checkout page
  - profile page
  - signin page
  - register page
  - protected route /home
  - role
    - admin ( di dashboard )
    - user ( di storefront )
