require 'webrick'

root = File.expand_path('public', __dir__)
port = 3000

# Custom MIME types
mime_types = WEBrick::HTTPUtils::DefaultMimeTypes.dup
mime_types.update(
  'html' => 'text/html; charset=utf-8',
  'css'  => 'text/css; charset=utf-8',
  'js'   => 'application/javascript; charset=utf-8',
  'json' => 'application/json; charset=utf-8',
  'svg'  => 'image/svg+xml'
)

server = WEBrick::HTTPServer.new(
  Port: port,
  BindAddress: '0.0.0.0',
  DocumentRoot: root,
  MimeTypes: mime_types,
  Logger: WEBrick::Log.new($stdout, WEBrick::Log::INFO),
  AccessLog: [[$stdout, WEBrick::AccessLog::COMBINED_LOG_FORMAT]]
)

trap('INT')  { server.shutdown }
trap('TERM') { server.shutdown }

puts "\n" + ("=" * 60)
puts "  🏃 GoRun Cambodia Web App Server Running"
puts "  🌐 URL: http://localhost:#{port}"
puts "  📂 Document Root: #{root}"
puts ("=" * 60) + "\n\n"

server.start
