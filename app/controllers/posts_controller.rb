class PostsController < ApplicationController
  before_action :authenticate_user!

  def new
    @post = Post.new
  end
  def create
    @post = Post.new(
      body: params[:body],
      user_id: params[:user_id],
      board_id: params[:board_id])
    @post.save
  end


  def edit
    @post = Post.find_by(id: params[:id])
    render 'edit.html.erb'
  end

  def update
    @post = Post.find_by(id: params[:id])
    @post.assign_attributes( 
       body: params[:body],
      user_id: params[:user_id],
      board_id: params[:board_id])
    if @post.save
      flash[:success] = "post updated"
      if post.tutorial_id
        redirect_to # tutorial else
      elsif post.
      redirect_to posts_path 
    else
      flash[:warning] = @post.errors.full_messages.join(", ")
      render :edit
    end
  end

  def destroy
    @post = Post.find_by(id: params[:id])
    @post.destroy

    flash[:warning] = "Post has been deleted"
    redirect_to "/"
  end
end
