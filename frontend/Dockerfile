# Use an official Apache HTTP Server image as the base
FROM httpd:latest

# Enable .htaccess by updating the Apache configuration
RUN sed -i 's/AllowOverride None/AllowOverride All/g' /usr/local/apache2/conf/httpd.conf

RUN sed -i 's/#LoadModule rewrite_module modules\/mod_rewrite.so/LoadModule rewrite_module modules\/mod_rewrite.so/g' /usr/local/apache2/conf/httpd.conf
# Copy the .htaccess file into the default document root
COPY dist /usr/local/apache2/htdocs
COPY .htaccess /usr/local/apache2/htdocs/.htaccess
EXPOSE 80
