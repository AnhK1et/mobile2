import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';

// Define a type for cart items
interface CartItem {
  id: number | string;  // Allow both number and string IDs
  title: string;
  price: number;
  image: string;
  quantity: number;
  color: string;
  storage: string;
}

interface Cart {
  items: CartItem[];
  total: number;
}

// Thêm interface để định nghĩa kiểu dữ liệu sản phẩm
interface Product {
  id: number;
  name: string;
  price: string | number;
  image: string;
  category_id: number;
  description?: string;
}

// Thêm interface cho cấu hình
interface Configuration {
  storage: string;
  price: number;
}

const DetailsScreen = ({ route, navigation }: { route: any, navigation: any }) => {
  const { product } = route.params as { product: Product };
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });
  const [cartCount, setCartCount] = useState(0);
  const [selectedColor, setSelectedColor] = useState('Titan Tự Nhiên'); // Thay đổi default
  const [selectedConfig, setSelectedConfig] = useState<Configuration>({
    storage: '256GB',
    price: 41990000
  });

  // Thêm mảng cấu hình
  const configurations: Configuration[] = [
    { storage: '1TB', price: 52990000 },
    { storage: '512GB', price: 45990000 },
    { storage: '256GB', price: 41990000 }
  ];

  // Thay đổi mảng cấu hình thành mảng màu sắc
  const colors = [
    { name: 'Titan Tự Nhiên', code: '#E2E4E1' },
    { name: 'Titan Xanh', code: '#4B4F58' },
    { name: 'Titan Đen', code: '#4A4846' },
    { name: 'Titan Trắng', code: '#F5F5F0' },
  ];

  // Thêm state cho sản phẩm liên quan
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    fetchRelatedProducts();
  }, [product.category_id]);

  const loadCart = async () => {
    try {
      const savedCart = await AsyncStorage.getItem('cart');
      if (savedCart) {
        const cartData = JSON.parse(savedCart);
        setCart(cartData);
        const totalItems = cartData.items.reduce(
          (total: number, item: CartItem) => total + item.quantity, 
          0
        );
        setCartCount(totalItems);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      const response = await apiService.get(`/products?category_id=${product.category_id}&limit=4`);
      // Lọc bỏ sản phẩm hiện tại
      const filtered = response.data.filter((p: Product) => p.id !== product.id);
      setRelatedProducts(filtered);
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  const addToCart = async () => {
    try {
      // Khởi tạo giỏ hàng mới nếu chưa có
      let currentCart: Cart = { items: [], total: 0 };

      // Lấy giỏ hàng từ AsyncStorage
      const savedCart = await AsyncStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // Kiểm tra tính hợp lệ của dữ liệu
        if (parsedCart && Array.isArray(parsedCart.items)) {
          currentCart = parsedCart;
        }
      }

      // Chuyển đổi giá tiền sang số
      const price = typeof product.price === 'string' 
        ? parseInt(product.price.replace(/\D/g, ''))
        : Number(product.price);

      // Tạo item mới
      const newCartItem: CartItem = {
        id: product.id.toString(),
        title: product.name,
        price: selectedConfig.price,
        image: product.image,
        quantity: quantity,
        color: selectedColor,
        storage: selectedConfig.storage
      };

      // Kiểm tra xem sản phẩm đã tồn tại chưa
      const existingItemIndex = currentCart.items.findIndex(
        (item) => item.id === newCartItem.id && item.color === newCartItem.color
      );

      if (existingItemIndex !== -1) {
        // Cập nhật số lượng nếu sản phẩm đã tồn tại
        currentCart.items[existingItemIndex].quantity += quantity;
      } else {
        // Thêm sản phẩm mới vào giỏ hàng
        currentCart.items.push(newCartItem);
      }

      // Tính lại tổng tiền
      currentCart.total = currentCart.items.reduce(
        (sum, item) => sum + (item.price * (item.quantity || 0)),
        0
      );

      // Lưu giỏ hàng vào AsyncStorage
      await AsyncStorage.setItem('cart', JSON.stringify(currentCart));
      
      // Cập nhật state
      setCart(currentCart);
      
      // Cập nhật số lượng sản phẩm trong giỏ hàng
      const newCartCount = currentCart.items.reduce(
        (total, item) => total + (item.quantity || 0),
        0
      );
      setCartCount(newCartCount);

      // Thông báo thành công
      alert(`Đã thêm ${product.name} vào giỏ hàng!`);

    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng');
    }
  };

  console.log('Product:', product); // Kiểm tra giá trị của product

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Cart')} 
          style={styles.cartButton}
        >
          <Icon name="cart-outline" size={24} color="black" />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView>
        <Image source={{ uri: product.image }} style={styles.productImage} />
        
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          
          {/* Phần cấu hình bộ nhớ */}
          <View style={styles.configContainer}>
            {configurations.map((config, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.configOption,
                  selectedConfig.storage === config.storage && styles.selectedConfigOption
                ]}
                onPress={() => setSelectedConfig(config)}
              >
                <Text style={[
                  styles.configText,
                  selectedConfig.storage === config.storage && styles.selectedConfigText
                ]}>
                  {config.storage}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.productPrice}>
            {selectedConfig.price.toLocaleString()} VND
          </Text>
          <Text style={styles.additionalInfo}>Mới, đầy đủ phụ kiện từ nhà sản xuất</Text>
          
          <View style={styles.quantityContainer}>
            <Icon name="time-outline" size={20} color="#666" />
            <Text style={styles.quantity}>1</Text>
          </View>
        </View>

        {/* Thay đổi phần chọn kích thước thành chọn màu sắc */}
        <View style={styles.colorSection}>
          <Text style={styles.colorTitle}>Màu sắc đã chọn: {selectedColor}</Text>
          <View style={styles.colorOptions}>
            {colors.map((color, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.colorOption,
                  selectedColor === color.name && styles.selectedColorOption,
                  { backgroundColor: color.code }
                ]}
                onPress={() => setSelectedColor(color.name)}
              >
                {selectedColor === color.name && (
                  <Icon name="checkmark" size={20} color="#FFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.colorNames}>
            {colors.map((color, index) => (
              <Text
                key={index}
                style={[
                  styles.colorName,
                  selectedColor === color.name && styles.selectedColorName
                ]}
              >
                {color.name}
              </Text>
            ))}
          </View>
        </View>

        <TouchableOpacity 
          style={styles.addToCartButton}
          onPress={addToCart}
        >
          <Text style={styles.addToCartText}>Thêm vào giỏ hàng</Text>
        </TouchableOpacity>

        {/* Phần sản phẩm liên quan */}
        <View style={styles.relatedSection}>
          <Text style={styles.relatedTitle}>Sản phẩm liên quan</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {relatedProducts.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.relatedItem}
                onPress={() => navigation.push('Details', { product: item })}
              >
                <Image 
                  source={{ uri: item.image }} 
                  style={styles.relatedImage} 
                />
                <Text style={styles.relatedName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.relatedPrice}>
                  {typeof item.price === 'number' 
                    ? item.price.toLocaleString() 
                    : parseInt(item.price).toLocaleString()} VND
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  cartButton: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    right: -8,
    top: -8,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 16,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    color: '#000',
    marginBottom: 8,
  },
  additionalInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  quantity: {
    marginLeft: 8,
    color: '#666',
  },
  sizeSection: {
    padding: 16,
  },
  sizeTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  sizeOptions: {
    flexDirection: 'row',
    gap: 16,
  },
  sizeOption: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    width: 80,
    height: 40,
  },
  selectedSizeOption: {
    borderColor: '#FF3B30',
    backgroundColor: '#FF3B30',
  },
  sizeText: {
    fontSize: 14,
    color: '#000',
  },
  selectedSizeText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  addToCartButton: {
    backgroundColor: '#FF3B30',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addToCartText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  configContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: 10,
  },
  configOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  selectedConfigOption: {
    borderColor: '#D70018',
    backgroundColor: '#FFF5F5',
  },
  configText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  selectedConfigText: {
    color: '#D70018',
    fontWeight: 'bold',
  },
  colorSection: {
    padding: 16,
  },
  colorTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  colorOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorOption: {
    borderColor: '#FF3B30',
  },
  colorNames: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  colorName: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    width: 80,
  },
  selectedColorName: {
    color: '#FF3B30',
    fontWeight: 'bold',
  },
  relatedSection: {
    padding: 16,
    backgroundColor: '#fff',
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  relatedItem: {
    width: 160,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  relatedImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
    borderRadius: 8,
    marginBottom: 8,
  },
  relatedName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    height: 40,
  },
  relatedPrice: {
    fontSize: 14,
    color: '#D70018',
    fontWeight: 'bold',
  },
});

export default DetailsScreen;
