import { StyleSheet, Text, View, FlatList } from 'react-native'
import React from 'react'

const faqData = [
  { 
    id: '1', 
    question: 'iPhone chạy hệ điều hành gì? Hệ điều hành mới nhất của iPhone là gì?' 
  },
  { 
    id: '2', 
    question: 'Sản phẩm Apple được bảo hành như thế nào? Đến đâu để được nhận bảo hành?' 
  },
  { 
    id: '3', 
    question: 'CellphoneS có hỗ trợ mua iPhone trả góp không?' 
  },
  // ... thêm các câu hỏi khác tương tự
];

const Notifications = () => {
  const renderItem = ({ item }: { item: { id: string; question: string } }) => (
    <View style={styles.faqItem}>
      <Text style={styles.faqText}>{item.question}</Text>
      <Text style={styles.arrowIcon}>›</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CÂU HỎI THƯỜNG GẶP</Text>
      <FlatList
        data={faqData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#ff0000',
    padding: 15,
  },
  listContainer: {
    paddingHorizontal: 15,
  },
  faqItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  faqText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  arrowIcon: {
    fontSize: 24,
    color: '#666',
  }
});
