# Home Images Block with Parallax Effect

Block này tạo hiệu ứng parallax mượt mà cho các hình ảnh khi người dùng cuộn trang.

## Tính năng

- **Hiệu ứng Parallax**: Mỗi hình ảnh di chuyển với tốc độ khác nhau khi cuộn
- **Responsive**: Tự động điều chỉnh cho các kích thước màn hình khác nhau
- **Performance**: Sử dụng `requestAnimationFrame` để tối ưu hiệu suất
- **Hover Effects**: Hiệu ứng zoom nhẹ khi hover vào hình ảnh
- **Smooth Transitions**: Chuyển động mượt mà với CSS transitions

## Cách sử dụng

1. **Thêm block vào trang**: Sử dụng AEM Sidekick để thêm block `home-images`
2. **Chèn hình ảnh**: Sử dụng trình soạn thảo nội dung để chèn hình ảnh
3. **Tự động áp dụng**: Hiệu ứng parallax sẽ tự động áp dụng cho tất cả hình ảnh

## Cấu trúc HTML

Block sẽ tạo ra HTML với cấu trúc:

```html
<div class="section home-images" data-section-status="loaded">
  <div class="default-content-wrapper">
    <p>
      <picture>
        <source type="image/webp" srcset="..." media="(min-width: 600px)">
        <source type="image/webp" srcset="...">
        <source type="image/jpeg" srcset="..." media="(min-width: 600px)">
        <img loading="lazy" alt="..." src="..." width="750" height="426">
      </picture>
    </p>
    <!-- Thêm hình ảnh khác tương tự -->
  </div>
</div>
```

## Tùy chỉnh

### Thay đổi tốc độ parallax

Trong file `home-images.js`, điều chỉnh giá trị `speed`:

```javascript
const parallaxConfig = {
  speed: 0.5, // Tăng để hiệu ứng mạnh hơn, giảm để nhẹ hơn
  // ...
};
```

### Thay đổi hướng di chuyển

Mỗi hình ảnh có hướng di chuyển khác nhau:
- Hình 1: Di chuyển lên trên
- Hình 2: Di chuyển xuống dưới  
- Hình 3: Di chuyển lên trên nhẹ

### CSS Custom Properties

Block sử dụng CSS custom properties để điều khiển transform:

```css
--parallax-offset-1: /* offset cho hình 1 */
--parallax-offset-2: /* offset cho hình 2 */
--parallax-offset-3: /* offset cho hình 3 */
```

## Responsive

- **Mobile**: Padding và margin nhỏ hơn
- **Tablet**: Tăng padding lên `var(--spacing-big)`
- **Desktop**: Tối ưu cho màn hình lớn

## Performance

- Sử dụng `requestAnimationFrame` để tối ưu scroll events
- `will-change: transform` để tối ưu GPU
- Throttled scroll handler để giảm thiểu tính toán
- Passive scroll listeners để cải thiện performance

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Troubleshooting

### Hình ảnh không di chuyển
- Kiểm tra console để xem có lỗi JavaScript không
- Đảm bảo block có class `parallax-enabled`

### Hiệu ứng quá mạnh/yếu
- Điều chỉnh giá trị `speed` trong `parallaxConfig`
- Giá trị từ 0.1 đến 1.0

### Performance kém
- Giảm số lượng hình ảnh
- Giảm giá trị `speed`
- Kiểm tra các block JavaScript khác có thể gây conflict
