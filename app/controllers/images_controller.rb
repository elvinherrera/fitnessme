class ImagesController < ApplicationController
   def new
    @tutorial = tutorial.find_by(id: params[:tutorial_id])
    render 'new.html.erb'
  end

  def create
    @image = Image.create(
      url: params[:url],
      tutorial_id: params[:tutorial_id]
      )
    redirect_to "/tutorials/#{params[:tutorial_id]}"
  end
end
