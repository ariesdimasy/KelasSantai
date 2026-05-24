CREATE TABLE users (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(20) NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_email (email), -- index untuk percepat pencarian
    INDEX idx_username (username)
);

CREATE TABLE products (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL, -- Fixed to allow cents/decimal points
    stock INT NOT NULL,
    is_active TINYINT (1) NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    INDEX idx_name (name)
);

ALTER TABLE products
ADD create_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE products
ADD updated_at timestamp NOT NULL default CURRENT_TIMESTAMP ON UPDATE current_timestamp;

insert into
    products (
        name,
        description,
        price,
        stock,
        is_active,
        create_at
    )
VALUES (
        'Laptop ASUS ROG Strix G16',
        'Laptop gaming Intel Core i7-13650HX, RAM 16GB, SSD 512GB, RTX 4060.',
        21500000.00,
        15,
        1,
        now()
    ),
    (
        'Monitor Gaming LG UltraGear 24GN60R',
        'Monitor IPS 24 inch, Full HD, 144Hz, 1ms Response Time.',
        18500000.00,
        25,
        1,
        now()
    ),
    (
        'Keyboard Mechanical Digital Alliance Meca Sport',
        'Keyboard mechanical layout 60%, Blue Switch, RGB Backlight.',
        350000.00,
        50,
        1,
        now()
    ),
    (
        'Mouse Wireless Logitech G304 LightSpeed',
        'Mouse gaming wireless dengan sensor HERO 12K DPI, warna hitam.',
        499000.00,
        40,
        1,
        now()
    ),
    (
        'PC Desktop Asus ROG Strix G13CH',
        'PC Gaming Desktop Intel Core i5-13400F, RAM 8GB, SSD 512GB, GTX 1650.',
        13250000.00,
        8,
        1,
        now()
    );

INSERT into
    users (
        name,
        email,
        username,
        password
    )
values (
        "dimas yudhistira",
        "dimas@gmail.com",
        "dimas",
        "goodluck12345"
    );

INSERT into
    users (
        name,
        email,
        username,
        password
    )
values (
        'tinular randi',
        "tinular.randi@gmail.com",
        "tinular",
        "123456"
    ),
    (
        'farida',
        'farida@gmail.com',
        'farida',
        '123456'
    )

select row_count ();

insert into
    users (
        name,
        email,
        username,
        password
    )
values (
        'farida',
        'farida@gmail.com',
        'farida',
        '123456'
    );

select * from users;
-- memngambil seluruh data table users
-- * artinya semua column

select name, email from users

select name as nama, email as ya_email_lah from users;

-- aggregate function
select max(price) from products p;

select min(price) from products p;

select avg(price) from products;

select count(id) from products;

select sum(price) from products;

select * from products where price > 10000000;

select * from products limit 3 offset 2;

select * from products limit 2, 3

update products
set
    -- name='Mouse Wireless Logitech G304 LightSpeed',
    -- description='Mouse gaming wireless dengan sensor HERO 12K DPI, warna hitam.',
    price = 500000,
    stock = 60
WHERE
    id = 4;

-- commit
-- rollback

INSERT INTO
    products (
        name,
        description,
        price,
        stock,
        is_active,
        create_at
    )
VALUES (
        'Printer Epson L3210 AIO',
        'Printer Ink Tank All-in-One untuk cetak, scan, dan copy.',
        2350000.00,
        20,
        1,
        now()
    ),
    (
        'SSD Samsung 980 NVMe M.2 1TB',
        'SSD internal kecepatan baca hingga 3500 MB/s.',
        1450000.00,
        30,
        1,
        now()
    ),
    (
        'RAM Corsair Vengeance LPX DDR4 16GB',
        'RAM PC Desktop 2x8GB DDR4 3200MHz C16 Hitam.',
        750000.00,
        15,
        1,
        now()
    ),
    (
        'Headset Gaming Rusak Merk X',
        'Headset contoh untuk test data - Kondisi bad stock.',
        150000.00,
        0,
        0,
        now()
    ), -- Rencana Hapus 1
    (
        'Webcam Logi C270 KW Super',
        'Webcam tiruan untuk test data - Kualitas tidak sesuai.',
        99000.00,
        0,
        0,
        now()
    );
-- Rencana Hapus 2

-- delete from products ; -- semua data akan terhapus

-- hard delete : data benar - benar terhapus dari table
delete from products where id = 9;

delete from products where id = 10;

-- soft delete , bisa dikembalikan set nya
update products set is_active = 0 where id = 5;

update products set is_active = 1 where id = 7;

select * from products p where p.is_active = 1;

select * from products p where p.is_active = 0;