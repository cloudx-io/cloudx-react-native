require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "cloudx-react-native"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = "https://github.com/cloudx-io/cloudx-react-native"
  s.license      = package["license"]
  s.authors      = { "CloudX" => "support@cloudx.io" }
  s.platforms    = { :ios => "12.0" }
  s.source       = { :git => "https://github.com/cloudx-io/cloudx-react-native.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm}"
  s.requires_arc = true

  s.dependency "React"
  s.dependency "CloudXCore"
end