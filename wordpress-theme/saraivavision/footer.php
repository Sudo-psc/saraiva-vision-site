<?php if (!defined('ABSPATH')) { exit; } ?>
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <div>
        <div class="footer-heading"><?php bloginfo('name'); ?></div>
        <p><?php bloginfo('description'); ?></p>
        <?php if ($phone = get_theme_mod('phone_number')): ?>
          <p>📞 <?php echo esc_html($phone); ?></p>
        <?php endif; ?>
        <?php if ($addr = get_theme_mod('clinic_address')): ?>
          <p>📍 <?php echo esc_html($addr); ?></p>
        <?php endif; ?>
      </div>
      <div>
        <div class="footer-heading"><?php _e('Navegação', 'saraivavision'); ?></div>
        <?php wp_nav_menu(['theme_location' => 'footer', 'container' => false]); ?>
      </div>
      <div>
        <div class="footer-heading"><?php _e('Contato Rápido', 'saraivavision'); ?></div>
        <?php if ($phone): ?>
          <p><a class="btn btn-outline" href="https://api.whatsapp.com/send?phone=5533998601427" target="_blank" rel="noopener">WhatsApp</a></p>
        <?php endif; ?>
      </div>
    </div>
    <div class="container" style="margin-top:1rem;font-size:.85rem;">
      <p>&copy; <?php echo date('Y'); ?> <?php bloginfo('name'); ?>. <?php _e('Todos os direitos reservados.', 'saraivavision'); ?></p>
    </div>
  </footer>
  <?php wp_footer(); ?>
</body>
</html>

