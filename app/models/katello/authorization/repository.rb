module Katello
  module Authorization::Repository
    extend ActiveSupport::Concern

    delegate :editable?, to: :product

    def deletable?
      product.editable? && !promoted?
    end

    def redhat_deletable?
      !self.promoted? && self.product.editable?
    end

    def readable?
      self.class.readable.where("#{self.class.table_name}.id" => self.id).any?
    end

    delegate :syncable?, to: :product

    module ClassMethods
      def readable
        in_products = Repository.in_product(Katello::Product.authorized(:view_products)).select(:id)
        in_environments = Repository.where(:environment_id => Katello::KTEnvironment.authorized(:view_lifecycle_environments)).select(:id)
        in_content_views = Repository.joins(:content_view_repositories).where("#{ContentViewRepository.table_name}.content_view_id" => Katello::ContentView.readable).select(:id)
        in_versions = Repository.joins(:content_view_version).where("#{Katello::ContentViewVersion.table_name}.content_view_id" => Katello::ContentView.readable).select(:id)
        joins(:root).where("#{Repository.table_name}.id in (?) or #{self.table_name}.id in (?) or #{self.table_name}.id in (?) or #{self.table_name}.id in (?)", in_products, in_content_views, in_versions, in_environments)
      end

      def deletable
        in_product(Katello::Product.authorized(:destroy_products))
      end

      def syncable
        in_product(Katello::Product.authorized(:sync_products))
      end
    end
  end
end
