<?php if (!defined('ABSPATH')) { exit; } ?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo('charset'); ?>" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="theme-color" content="#0066cc" />
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
  <a class="skip-link" href="#content"><?php _e('Pular para o conteúdo', 'saraivavision'); ?></a>
  <header class="site-header">
    <div class="container brand">
      <div class="site-branding">
        <?php if (has_custom_logo()) { the_custom_logo(); } ?>
        <div>
          <div class="site-title"><a href="<?php echo esc_url(home_url('/')); ?>"><?php bloginfo('name'); ?></a></div>
          <div class="site-description"><?php bloginfo('description'); ?></div>
        </div>
      </div>
      <nav class="primary" aria-label="<?php esc_attr_e('Menu Principal', 'saraivavision'); ?>">
        <?php
          wp_nav_menu([
            'theme_location' => 'primary',
            'container'      => false,
            'items_wrap'     => '%3$s',
            'fallback_cb'    => false,
            'depth'          => 1,
            'link_before'    => '<span>',
            'link_after'     => '</span>',
          ]);
        ?>
      </nav>
    </div>
  </header>
  <main id="content">

