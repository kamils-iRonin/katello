Katello::RepositoryTypeManager.register(::Katello::Repository::DEB_TYPE) do
  service_class Katello::Pulp::Repository::Deb
  prevent_unneeded_metadata_publish
end
